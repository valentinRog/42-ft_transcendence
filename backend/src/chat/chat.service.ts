import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaClient) {}

  async sendMessage(senderUsername: string, friendUsername: string, chatId: number | null, content: string) {
    let chat;

    if (chatId) {
        chat = await this.prisma.chat.findUnique({
            where: { id: chatId },
        });
    } else {
        chat = await this.prisma.chat.findFirst({
            where: {
                AND: [
                    { chatUsers: { some: { user: { username: senderUsername } } } },
                    { chatUsers: { some: { user: { username: friendUsername } } } }
                ]
            }
        });
    }

    if (!chat) {
        chat = await this.prisma.chat.create({
            data: {
                isGroupChat: false,
                name: `${senderUsername}-${friendUsername}`,
                chatUsers: {
                    create: [
                        { user: { connect: { username: senderUsername } } },
                        { user: { connect: { username: friendUsername } } }
                    ]
                }
            }
        });
    }

    const newMessage = await this.prisma.message.create({
        data: {
            content,
            user: { connect: { username: senderUsername } },
            chat: { connect: { id: chat.id } },
        },
    });

    return newMessage;
  }


  async getAllUserMessages(username: string) {
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
        messages: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
    const allMessages = chats.flatMap(chat => 
      chat.messages.map(message => ({
        chatId: chat.id,
        from: message.user.username,
        content: message.content,
        createdAt: message.createdAt
      }))
    );
    allMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return allMessages;
  }

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

  async createChatGroup(groupName: string, memberUsernames: string[]) {
    const newGroupChat = await this.prisma.chat.create({
      data: {
        isGroupChat: true,
        name: groupName,
        chatUsers: {
          create: memberUsernames.map(username => ({
            user: { connect: { username } }
          }))
        }
      }
    });
    return newGroupChat;
  }
}
