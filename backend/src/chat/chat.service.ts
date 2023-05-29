import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaClient) {}

  async sendMessage(senderUsername: string, recipientUsername: string, content: string) {
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        AND: [
          { chatUsers: { some: { user: { username: senderUsername } } } },
          { chatUsers: { some: { user: { username: recipientUsername } } } }
        ]
      }
    });
  
    let newMessage;
  
    if (existingChat) {
      newMessage = await this.prisma.message.create({
        data: {
          content,
          user: { connect: { username: senderUsername } },
          chat: { connect: { id: existingChat.id } }
        }
      });
    } else {
      const newChat = await this.prisma.chat.create({
        data: {
          isGroupChat: false,
          name: `${senderUsername}-${recipientUsername}`,
          chatUsers: {
            create: [
              { user: { connect: { username: senderUsername } } },
              { user: { connect: { username: recipientUsername } } }
            ]
          }
        }
      });
  
      newMessage = await this.prisma.message.create({
        data: {
          content,
          user: { connect: { username: senderUsername } },
          chat: { connect: { id: newChat.id } }
        }
      });
    }
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
}
