import { Content, GoogleGenAI } from '@google/genai';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatRole, NewsCategory } from '@prisma/client';

import { CATEGORY_LABELS } from '../news/category-label';
import { formatPublishedLabel } from '../news/time-label';
import { PrismaService } from '../prisma/prisma.service';
import { buildChatSystemInstruction } from './chat.prompt';

interface StoredMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: Date;
}

interface ClusterForChat {
  id: string;
  aiTitle: string;
  aiBriefing: string;
  category: NewsCategory;
  generatedAt: Date | null;
  updatedAt: Date;
}

@Injectable()
export class ChatService {
  private client: GoogleGenAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async listRooms(clientId: string) {
    const rooms = await this.prisma.chatRoom.findMany({
      where: { clientId, cluster: { status: 'ACTIVE', aiTitle: { not: null }, aiBriefing: { not: null } } },
      orderBy: { updatedAt: 'desc' },
      include: {
        cluster: {
          select: {
            id: true,
            aiTitle: true,
            aiBriefing: true,
            category: true,
            generatedAt: true,
            updatedAt: true,
          },
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });

    return rooms.map((room) =>
      this.toRoom(
        room.cluster as ClusterForChat,
        [...room.messages].reverse(),
        room.updatedAt,
      ),
    );
  }

  async getRoom(clientId: string, clusterId: string) {
    const cluster = await this.getCluster(clusterId);
    const room = await this.prisma.chatRoom.findUnique({
      where: { clientId_clusterId: { clientId, clusterId } },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });

    return this.toRoom(cluster, [...(room?.messages ?? [])].reverse(), room?.updatedAt);
  }

  async sendMessage(clientId: string, clusterId: string, message: string) {
    const cluster = await this.getClusterWithArticles(clusterId);
    const existingRoom = await this.prisma.chatRoom.findUnique({
      where: { clientId_clusterId: { clientId, clusterId } },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    const history = [...(existingRoom?.messages ?? [])].reverse();
    const answer = await this.generateAnswer(cluster, history, message);
    const userCreatedAt = new Date();
    const assistantCreatedAt = new Date(userCreatedAt.getTime() + 1);

    const room = await this.prisma.$transaction(async (transaction) => {
      const savedRoom = await transaction.chatRoom.upsert({
        where: { clientId_clusterId: { clientId, clusterId } },
        create: { clientId, clusterId, updatedAt: assistantCreatedAt },
        update: { updatedAt: assistantCreatedAt },
      });
      await transaction.chatMessage.createMany({
        data: [
          { roomId: savedRoom.id, role: 'USER', content: message, createdAt: userCreatedAt },
          {
            roomId: savedRoom.id,
            role: 'ASSISTANT',
            content: answer,
            createdAt: assistantCreatedAt,
          },
        ],
      });
      return transaction.chatRoom.findUniqueOrThrow({
        where: { id: savedRoom.id },
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 50 } },
      });
    });

    return this.toRoom(cluster, [...room.messages].reverse(), room.updatedAt);
  }

  async leaveRoom(clientId: string, clusterId: string) {
    const deleted = await this.prisma.chatRoom.deleteMany({ where: { clientId, clusterId } });
    return { deleted: deleted.count > 0 };
  }

  private async getCluster(clusterId: string): Promise<ClusterForChat> {
    const cluster = await this.prisma.newsCluster.findFirst({
      where: {
        id: clusterId,
        status: 'ACTIVE',
        aiTitle: { not: null },
        aiBriefing: { not: null },
      },
      select: {
        id: true,
        aiTitle: true,
        aiBriefing: true,
        category: true,
        generatedAt: true,
        updatedAt: true,
      },
    });
    if (!cluster?.aiTitle || !cluster.aiBriefing) {
      throw new NotFoundException('대화할 뉴스 브리핑을 찾을 수 없습니다.');
    }
    return cluster as ClusterForChat;
  }

  private async getClusterWithArticles(clusterId: string) {
    const cluster = await this.prisma.newsCluster.findFirst({
      where: {
        id: clusterId,
        status: 'ACTIVE',
        aiTitle: { not: null },
        aiBriefing: { not: null },
      },
      select: {
        id: true,
        aiTitle: true,
        aiBriefing: true,
        category: true,
        generatedAt: true,
        updatedAt: true,
        articles: {
          where: { status: 'CLUSTERED' },
          orderBy: { publishedAt: 'desc' },
          take: 20,
          select: {
            publisher: true,
            title: true,
            cleanDescription: true,
            url: true,
          },
        },
      },
    });
    if (!cluster?.aiTitle || !cluster.aiBriefing) {
      throw new NotFoundException('대화할 뉴스 브리핑을 찾을 수 없습니다.');
    }
    return {
      ...cluster,
      aiTitle: cluster.aiTitle,
      aiBriefing: cluster.aiBriefing,
    };
  }

  private async generateAnswer(
    cluster: Awaited<ReturnType<ChatService['getClusterWithArticles']>>,
    history: StoredMessage[],
    message: string,
  ) {
    const model =
      this.config.get<string>('GEMINI_CHAT_MODEL') ??
      this.config.get<string>('GEMINI_GENERATION_MODEL') ??
      'gemini-3.8-flash';
    const contents: Content[] = [
      ...history.map((item) => ({
        role: item.role === 'USER' ? 'user' : 'model',
        parts: [{ text: item.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];
    const response = await this.getClient().models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: buildChatSystemInstruction({
          title: cluster.aiTitle,
          briefing: cluster.aiBriefing,
          articles: cluster.articles.map((article) => ({
            publisher: article.publisher,
            title: article.title,
            description: article.cleanDescription,
            url: article.url,
          })),
        }),
        temperature: 0.25,
        maxOutputTokens: 1000,
      },
    });
    const answer = response.text?.trim();
    if (!answer) throw new Error('Gemini가 채팅 답변을 반환하지 않았습니다.');
    return answer;
  }

  private toRoom(
    cluster: ClusterForChat,
    messages: StoredMessage[],
    roomUpdatedAt?: Date,
  ) {
    const briefingCreatedAt = cluster.generatedAt ?? cluster.updatedAt;
    const updatedAt = roomUpdatedAt ?? briefingCreatedAt;
    return {
      clusterId: cluster.id,
      title: cluster.aiTitle,
      category: CATEGORY_LABELS[cluster.category],
      updatedAt: updatedAt.toISOString(),
      updatedLabel: formatPublishedLabel(updatedAt),
      messages: [
        {
          id: `${cluster.id}-briefing`,
          role: 'assistant' as const,
          content: cluster.aiBriefing,
          createdAt: briefingCreatedAt.toISOString(),
          isBriefing: true,
        },
        ...messages.map((item) => ({
          id: item.id,
          role: item.role === 'USER' ? ('user' as const) : ('assistant' as const),
          content: item.content,
          createdAt: item.createdAt.toISOString(),
          isBriefing: false,
        })),
      ],
    };
  }

  private getClient() {
    if (this.client) return this.client;
    const apiKey = this.config.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    this.client = new GoogleGenAI({ apiKey });
    return this.client;
  }
}
