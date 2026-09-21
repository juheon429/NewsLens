import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { getCluster } from '@/data/mock-news';
import { ChatMessage, ChatRoom } from '@/types/news';

interface ChatContextValue {
  rooms: ChatRoom[];
  ensureRoom: (clusterId: string) => void;
  sendMessage: (clusterId: string, content: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const initialRoomIds = [
  'budget-review',
  'capital-flood',
  'ai-investment',
  'interest-rate',
];

function makeRoom(clusterId: string, order = 0): ChatRoom | undefined {
  const cluster = getCluster(clusterId);
  if (!cluster) return undefined;

  return {
    clusterId: cluster.id,
    title: cluster.representativeTitle,
    category: cluster.category,
    updatedAt: Date.now() - order * 25 * 60 * 1000,
    updatedLabel: order === 0 ? '10분 전' : order === 1 ? '35분 전' : order === 2 ? '2시간 전' : '어제',
    messages: [
      {
        id: `${cluster.id}-briefing`,
        role: 'assistant',
        content: cluster.summary,
        createdAt: '오후 09:59',
        isBriefing: true,
      },
    ],
  };
}

const initialRooms = initialRoomIds
  .map((id, index) => makeRoom(id, index))
  .filter((room): room is ChatRoom => Boolean(room));

export function ChatProvider({ children }: PropsWithChildren) {
  const [rooms, setRooms] = useState<ChatRoom[]>(initialRooms);

  const ensureRoom = useCallback((clusterId: string) => {
    setRooms((current) => {
      if (current.some((room) => room.clusterId === clusterId)) return current;
      const room = makeRoom(clusterId);
      return room ? [room, ...current] : current;
    });
  }, []);

  const sendMessage = useCallback((clusterId: string, content: string) => {
    const normalized = content.trim();
    if (!normalized) return;

    const userMessage: ChatMessage = {
      id: `${clusterId}-user-${Date.now()}`,
      role: 'user',
      content: normalized,
      createdAt: '방금',
    };

    setRooms((current) =>
      current.map((room) =>
        room.clusterId === clusterId
          ? {
              ...room,
              messages: [...room.messages, userMessage],
              updatedAt: Date.now(),
              updatedLabel: '방금',
            }
          : room,
      ),
    );

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `${clusterId}-assistant-${Date.now()}`,
        role: 'assistant',
        content:
          '현재는 프런트 화면 확인을 위한 샘플 응답입니다. 백엔드를 연결하면 이 뉴스 묶음과 관련 기사를 바탕으로 답변하게 됩니다.',
        createdAt: '방금',
      };

      setRooms((current) =>
        current.map((room) =>
          room.clusterId === clusterId
            ? {
                ...room,
                messages: [...room.messages, assistantMessage],
                updatedAt: Date.now(),
                updatedLabel: '방금',
              }
            : room,
        ),
      );
    }, 650);
  }, []);

  const value = useMemo(
    () => ({ rooms, ensureRoom, sendMessage }),
    [ensureRoom, rooms, sendMessage],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChats() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChats must be used inside ChatProvider');
  }
  return context;
}

