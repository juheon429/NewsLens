import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';

import { ChatService } from './chat.service';
import { parseChatMessage, parseClientId } from './chat.validation';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('rooms')
  listRooms(@Query('clientId') clientId?: string) {
    return this.chat.listRooms(parseClientId(clientId));
  }

  @Get('clusters/:clusterId')
  getRoom(@Param('clusterId') clusterId: string, @Query('clientId') clientId?: string) {
    return this.chat.getRoom(parseClientId(clientId), clusterId);
  }

  @Post('clusters/:clusterId/messages')
  sendMessage(
    @Param('clusterId') clusterId: string,
    @Body() body: { clientId?: unknown; message?: unknown },
  ) {
    return this.chat.sendMessage(
      parseClientId(body?.clientId),
      clusterId,
      parseChatMessage(body?.message),
    );
  }

  @Delete('clusters/:clusterId')
  leaveRoom(@Param('clusterId') clusterId: string, @Query('clientId') clientId?: string) {
    return this.chat.leaveRoom(parseClientId(clientId), clusterId);
  }
}
