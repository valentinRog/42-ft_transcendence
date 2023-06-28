import { Controller, Post, Get, Query, Param, Body } from '@nestjs/common';
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
  async getPublicChats(
    @Query('start') start: string,
    @Query('limit') limit: string,
  ) {
    const {chats, totalChatsCount} = await this.chatService.getChatsPublic(Number(start), Number(limit));
    return { chats, totalChatsCount };
  }

  @UseGuards(JwtGuard)
  @Get(':chatId')
  async findChatById(@Param('chatId') chatId: string) {
    const chat = await this.chatService.findChatById(Number(chatId));
    return chat;
  }

  @Post('verifyPassword')
  async verifyPassword(@Body() body: { chatId: string; password: string }) {
    const chat = await this.chatService.findChatById(Number(body.chatId));
    if (chat.accessibility === 'public' || chat.accessibility === 'private')
      return true;
    if (
      chat.accessibility === 'protected' &&
      chat.password &&
      chat.password === body.password
    )
      return true;
    else return false;
  }

  @UseGuards(JwtGuard)
  @Post('create-chat')
  async createChat(
    @Body('groupName') groupName: string,
    @Body('memberUsernames') memberUsernames: string[],
    @Body('isGroupChat') isGroupChat: boolean,
    @Body('accessibility') accessibility: string,
    @Body('password') password?: string,
  ) {
    const newGroupChat = await this.chatService.createChat(
      groupName,
      memberUsernames,
      isGroupChat,
      accessibility,
      password,
    );
    
    return newGroupChat;
  }
  
  @Post('updateLastMessageRead')
  async updateLastMessageRead(@Body() body): Promise<any> {
    const { chatId, messageId, userId } = body;
    return await this.chatService.updateLastMessageRead(chatId, messageId, userId);
  }
}
