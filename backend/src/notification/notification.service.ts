import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketService } from 'src/websocket/websocket.service';
import { UserService } from 'src/user/user.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private socketService: WebSocketService,
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async notifyEvent(friend: string, username: string, message: string) {
    let notif;
    if ((await this.userService.getUserStatus(friend)) != 'offline') {
      this.socketService.sendToUser(friend, username, message);
    }
    if (message === 'game') {
      throw new ForbiddenException(`${friend} is offline`);
    }
    try {
      notif = await this.prisma.notification.findFirst({
        where: {
          sender: username,
          type: message,
        },
      });

      notif = await this.prisma.notification.create({
        data: {
          user: {
            connect: {
              username: friend,
            },
          },
          sender: username,
          type: message,
        },
      });
      const prisma_friend = await this.prisma.user.findUnique({
        where: { username: friend },
      });
      if (!prisma_friend) throw new ForbiddenException('User not found');
      await this.prisma.user.update({
        where: { username: friend },
        data: {
          notifications: { connect: { id: notif.id } },
        },
      });
      return notif;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.prisma.notification.delete({
          where: { id: notif.id },
        });
        return await this.notifyEvent(friend, username, message);
      }
      throw error;
    }
  }

  async removeNotification(username: string, friend: string, message: string) {
    const prisma_friend = await this.prisma.user.findUnique({
      where: { username: friend },
    });
    if (!prisma_friend) throw new ForbiddenException('User not found');
    await this.prisma.user.update({
      where: { username: friend },
      data: {
        notifications: { disconnect: { id: prisma_friend.id } },
      },
    });
    await this.prisma.notification.deleteMany({
      where: {
        sender: username,
        type: message,
      },
    });
  }
}
