import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Chat, ChatUser, Message, User } from '../chat/model/chat.model';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getAllUserChats(username: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        chatUsers: {
          some: {
            user: {
              username: username
            }
          }
        }
      },
      include: {
        messages: true,
        chatUsers: {
          include: {
            user: true
          }
        }
      }
    });
    return chats;
  }

  async createChat(groupName: string, memberUsernames: string[], isGroupChat: boolean, accessibility: string, password?: string) : Promise<Chat | null> {
    const newGroupChat = await this.prisma.chat.create({
          data: {
            isGroupChat: isGroupChat,
            name: groupName,
            accessibility: accessibility,
            password: password,
            updatedAt: new Date(),
            createdAt: new Date(),
            chatUsers: {
                create: memberUsernames.map((username, index) => ({
                    user: { connect: { username } },
                    createdAt: new Date(),
                    lastReadMessageId: 0,
                    role: { connect: { id: index === 0 ? 1 : 3 } }
                }))
            }
        },
        include: {
          chatUsers: {
            include: {
              user: true,
              role: true
            }
          },
          messages: true,
        }
    });
    return newGroupChat;
  }


  async findChatById(id: number | null) : Promise<Chat | null> {
    if (id === undefined || id === null) 
      return null;
    const chat = await this.prisma.chat.findUnique({
        where: {
            id: id,
        },
        include: {
            chatUsers: {
              include: {
                user: true,
              },
            },
            messages: true,
        },
    });
    return chat;
  }

  async addMessageToDatabase(chatId: number, content: string, userId: number): Promise<Message> {
    const newMessage = await this.prisma.message.create({
      data: {
        content: content,
        chat: {
          connect: { id: chatId }
        },
        user: {
          connect: { id: userId }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return newMessage;
  }

  async leaveGroup(chatId: number, userId: number): Promise<any> {
    const result = await this.prisma.chatUser.deleteMany({
      where: {
        userId: userId,
        chatId: chatId
      }
    });
    return result;
  }

  async changeChatName(chatId: number, newName: string): Promise<any> {
    const result = await this.prisma.chat.update({
      where: {
        id: chatId
      },
      data: {
        name: newName
      }
    });
    return result;
  }

}