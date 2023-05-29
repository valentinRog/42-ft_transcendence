import { Controller, Post, Body, Get, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from '../auth/guard';
import { UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtGuard)
  @Post('add-message')
  async sendMessage(
    @GetUser() user,
    @Body('recipientUsername') recipientUsername: string,
    @Body('content') content: string
  ) {
    if (!recipientUsername) {
      throw new BadRequestException('Recipient username is required');
    }
    let newMessage = await this.chatService.sendMessage(user.username, recipientUsername, content);
    return newMessage;
  }

  @UseGuards(JwtGuard)
  @Get('allUserChats')
  async getAllUserChats(@GetUser() user) {
    const chats = await this.chatService.getAllUserChats(user.username);
    return chats;
  }

  @UseGuards(JwtGuard)
  @Get('allUserMessages')
  async getAllMessages(@GetUser() user) {
    const messages = await this.chatService.getAllUserMessages(user.username);
    return messages;
  }
  
  @UseGuards(JwtGuard)
  @Post('create-group-chat')
  async createGroupChat(
    @GetUser() user,
    @Body('groupName') groupName: string,
    @Body('memberUsernames') memberUsernames: string[]
  ) {
    if (!groupName || !memberUsernames || memberUsernames.length < 2) {
      throw new BadRequestException('Group name and at least two member usernames are required');
    }
    const newGroupChat = await this.chatService.createChatGroup(groupName, memberUsernames);
    return newGroupChat;
  }

}
