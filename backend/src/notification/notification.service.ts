import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketService } from 'src/websocket/websocket.service';
import { UserService } from 'src/user/user.service';

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
  }
}
