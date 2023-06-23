import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketService } from 'src/websocket/websocket.service';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private socketService: WebSocketService,
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async notifyEvent(prisma_friend: User, user: User, message: string) {
    try {
      const firstNotif = await this.prisma.notification.findFirst({
        where: {
          senderId: user.id,
          type: message,
          userId: prisma_friend.id,
        },
      });
      if (firstNotif) {
        await this.prisma.notification.delete({
          where: { id: firstNotif.id },
        });
      }
      const notif = await this.prisma.notification.create({
        data: {
          user: {
            connect: {
              id: prisma_friend.id,
            },
          },
          senderId: user.id,
          senderName: user.username,
          type: message,
        },
      });
      await this.prisma.user.update({
        where: { username: prisma_friend.username },
        data: {
          notifications: { connect: { id: notif.id } },
        },
      });
      if (
        (await this.userService.getUserStatus(prisma_friend.id)) != 'offline'
      ) {
        this.socketService.sendToUser(prisma_friend.id, user.username, message);
      }
      return notif;
    } catch (error) {
      throw new NotFoundException('Error in NotificationService');
    }
  }

  async removeNotification(friendId: number, message: string) {
    try {
      const userToNotify = await this.prisma.notification.findMany({
        where: {
          senderId: friendId,
          type: message,
        },
      });
      await this.prisma.notification.deleteMany({
        where: {
          senderId: friendId,
          type: message,
        },
      });
      return userToNotify.map((item) => item.userId);
    } catch (error) {
      console.log('No notifications found');
    }
  }
}
