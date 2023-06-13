import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from '../auth/guard';
import { UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtGuard)
  @Get('allUserChats')
  async getAllUserChats(@GetUser() user) {
    const chats = await this.chatService.getAllUserChats(user.username);
    return chats;
  }

  @UseGuards(JwtGuard)
  @Get('publicChats')
  async getPublicChats(@Query('start') start: string, @Query('limit') limit: string) {
    const chats = this.chatService.getChatsPublic(Number(start), Number(limit));
    return chats;
  }

  // @UseGuards(JwtGuard)
  // @Post('create-chat')
  // async createChat(
  //   @Body('groupName') groupName: string,
  //   @Body('memberUsernames') memberUsernames: string[],
  //   @Body('isGroupChat') isGroupChat: boolean
  // ) {
  //   const newGroupChat = await this.chatService.createChat(groupName, memberUsernames, isGroupChat);
  //   return newGroupChat;
  // }

}
