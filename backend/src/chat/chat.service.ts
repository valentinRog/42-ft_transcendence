import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Chat, Message } from '../chat/model/chat.model';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getAllUserChats(username: string): Promise<Chat[]> {
    const chats = await this.prisma.chat.findMany({
      where: {
        chatUsers: {
          some: {
            user: {
              username: username,
            },
          },
        },
      },
      include: {
        messages: {
          include: {
            user: true,
          },
        },
        chatUsers: {
          include: {
            user: true,
          },
        },
      },
    });
    return chats;
  }

  async createChat(
    groupName: string,
    memberUsernames: string[],
    isGroupChat: boolean,
    accessibility: string,
    password?: string,
  ): Promise<Chat | null> {
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
            role: { connect: { id: index === 0 ? 1 : 3 } },
          })),
        },
      },
      include: {
        chatUsers: {
          include: {
            user: true,
            role: true,
          },
        },
        messages: true,
        bans: true,
        mutes: true,
      },
    });
    return newGroupChat;
  }

  async findChatById(id: number | null): Promise<Chat | null> {
    if (id === undefined || id === null) return null;
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: id,
      },
      include: {
        chatUsers: {
          include: {
            user: true,
            role: true,
          },
        },
        messages: {
          include: {
            user: true,
          },
        },
        bans: true,
        mutes: true,
      },
    });
    return chat;
  }

  async addMessageToDatabase(
    chatId: number,
    content: string,
    userId: number,
  ): Promise<Message> {
    const newMessage = await this.prisma.message.create({
      data: {
        content: content,
        chat: {
          connect: { id: chatId },
        },
        user: {
          connect: { id: userId },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        user: true,
      },
    });
    return newMessage;
  }

  async leaveGroup(chatId: number, userId: number): Promise<any> {
    const result = await this.prisma.chatUser.deleteMany({
      where: {
        userId: userId,
        chatId: chatId,
      },
    });
    return result;
  }

  async changeChatName(chatId: number, newName: string): Promise<any> {
    const result = await this.prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        name: newName,
      },
    });
    return result;
  }

  async getChatsPublic(start: number, limit: number): Promise<any> {
    const chats = await this.prisma.chat.findMany({
      where: {
        OR: [
          {
            accessibility: 'public',
          },
          {
            accessibility: 'protected',
          },
        ],
      },
      select: {
        id: true,
        accessibility: true,
        password: true,
        name: true,
        chatUsers: true,
      },
      skip: start,
      take: limit,
    });

    const totalChatsCount = await this.prisma.chat.count({where: {accessibility: 'public'}});

    return {
      chats,
      totalChatsCount
    };
  }

  async addUserToChat(chatId: number, userId: number) {
    const chatUser = await this.prisma.chatUser.create({
      data: {
        chatId: chatId,
        userId: userId,
        roleId: 3,
        createdAt: new Date(),
        lastReadMessageId: 0,
      },
      include: {
        user: true,
        role: true,
      },
    });
    return chatUser;
  }

  async changeRole(chatId: number, userId: number, newRoleId: number) {
    const chatUser = await this.prisma.chatUser.findFirst({
      where: {
        chatId: chatId,
        userId: userId,
      },
    });

    if (!chatUser) return;

    const updatedChatUser = await this.prisma.chatUser.update({
      where: { id: chatUser.id },
      data: { roleId: newRoleId },
    });

    return updatedChatUser;
  }

  //BAN//

  async banUser(chatId: number, userId: number, duration: number | null) {
    const expiresAt = duration ? new Date(Date.now() + duration * 1000) : null;

    const existingBan = await this.prisma.ban.findUnique({
      where: { chatId_userId: { chatId: chatId, userId: userId } },
    });

    if (existingBan) {
      await this.prisma.ban.update({
        where: { chatId_userId: { chatId: chatId, userId: userId } },
        data: { expiresAt: expiresAt },
      });
    } else {
      await this.prisma.ban.create({
        data: {
          chatId,
          userId,
          expiresAt,
        },
      });
    }
    return expiresAt;
  }

  async unBanUser(chatId: number, userId: number) {
    const ban = await this.prisma.ban.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!ban) return;

    await this.prisma.ban.delete({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });
  }

  //MUTE//

  async muteUser(chatId: number, userId: number, duration: number | null) {
    const expiresAt = duration ? new Date(Date.now() + duration * 1000) : null;
    const existingMute = await this.prisma.mute.findUnique({
      where: { chatId_userId: { chatId: chatId, userId: userId } },
    });

    if (existingMute) {
      await this.prisma.mute.update({
        where: { chatId_userId: { chatId: chatId, userId: userId } },
        data: { expiresAt: expiresAt },
      });
    } else {
      await this.prisma.mute.create({
        data: {
          chatId,
          userId,
          expiresAt,
        },
      });
    }
    return expiresAt;
  }

  async unMuteUser(chatId: number, userId: number) {
    const mute = await this.prisma.mute.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!mute) return;

    await this.prisma.mute.delete({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });
  }

  async setAccess(
    chatId: number,
    isProtected: boolean,
    password?: string,
  ): Promise<void> {
    const accessibility = isProtected ? 'public' : 'protected';

    const updateData = { accessibility };

    if (password !== undefined) updateData['password'] = password;

    await this.prisma.chat.update({
      where: { id: chatId },
      data: updateData,
    });
  }

  async setPassword(chatId: number, password: string): Promise<void> {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { password },
    });
  }

  async updateLastMessageRead(
    chatId: number,
    messageId: number,
    userId: number,
  ): Promise<any> {
    return await this.prisma.chatUser.update({
      where: {
        userId_chatId: { userId, chatId },
      },
      data: {
        lastReadMessageId: messageId,
      },
    });
  }
}
