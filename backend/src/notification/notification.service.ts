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
    if ((await this.userService.getUserStatus(friend)) != 'offline') {
      this.socketService.sendToUser(friend, username, message);
    }
    if (message === 'game') {
      throw new ForbiddenException(`${friend} is offline`);
    }
    try {
      const firstNotif = await this.prisma.notification.findFirst({
        where: {
          sender: username,
          type: message,
        },
      });
      if (firstNotif) {
        await this.prisma.notification.delete({
          where: { id: firstNotif.id },
        });
      }

      const prisma_friend = await this.prisma.user.findUnique({
        where: { username: friend },
      });
      const notif = await this.prisma.notification.create({
        data: {
          user: {
            connect: {
              id: prisma_friend.id,
            },
          },
          sender: username,
          type: message,
        },
      });

      await this.prisma.user.update({
        where: { username: prisma_friend.username },
        data: {
          notifications: { connect: { id: notif.id } },
        },
      });
      return notif;
    } catch (error) {
      console.log(error);
      throw new ForbiddenException('User not found');
    }
  }

  async removeNotification(username: string, friend: string, message: string) {
    const prisma_friend = await this.prisma.user.findUnique({
      where: { username: friend },
    });
    if (!prisma_friend) throw new ForbiddenException('User not found');
    //await this.prisma.user.update({
    //  where: { username: friend },
    //  data: {
    //    notifications: { disconnect: { id: prisma_friend.id } },
    //  },
    //});
    await this.prisma.notification.deleteMany({
      where: {
        sender: username,
        type: message,
      },
    });
  }
}
