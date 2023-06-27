import { Controller, Post, UseGuards, Body, Get, Query } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FriendDto } from 'src/user/dto';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notification.service';
import { ResponseDto } from './dto';
import { UserService } from 'src/user/user.service';
import { WebSocketService } from 'src/websocket/websocket.service';

@UseGuards(JwtGuard)
@Controller('notification')
export class NotificationController {
  constructor(
    private prisma: PrismaClient,
    private notifService: NotificationService,
    private userService: UserService,
    private socketService: WebSocketService,
  ) {}

  @Post('add-friend')
  async addFriend(@GetUser() user, @Body() dto: FriendDto) {
    const prisma_friend = await this.prisma.user.findUnique({
      where: { username: dto.friend },
    });
    if (!prisma_friend) throw new NotFoundException('User not found');
    else if (user.id == prisma_friend.id)
      throw new ForbiddenException('You cannot add yourself as a friend');
    else if (await this.userService.findFriend(user.id, prisma_friend.id)) {
      throw new ForbiddenException('You are already friends');
    }
    return await this.notifService.notifyEvent(prisma_friend, user, 'friend');
  }

  @Post('friend-response')
  async responseFriend(@GetUser('id') id, @Body() dto: ResponseDto) {
    const prisma_friend = await this.prisma.user.findUnique({
      where: { username: dto.friend },
    });
    await this.notifService.removeNotification(prisma_friend.id, 'friend');
    if (dto.response) {
      if (!prisma_friend) throw new NotFoundException('User not found');
      return await this.userService.addFriend(id, prisma_friend.id);
    }
    return { message: 'declined' };
  }

  @Post('ask-game')
  async match(@GetUser() user, @Body() dto: FriendDto) {
    if (user.id == dto.friendId)
      throw new ForbiddenException('You cannot match yourself');
    const prisma_friend = await this.prisma.user.findUnique({
      where: { id: dto.friendId },
    });
    if (!prisma_friend) throw new NotFoundException('User not found');
    const socket = this.socketService.getSocket(prisma_friend.id);
    if (socket) socket.emit('game', { id: user.id, username: user.username });
  }

  @Get('get')
  async getNotification(@GetUser('id') id, @Query('type') type: string) {
    const prisma_user = await this.prisma.user.findUnique({
      where: { id: id },
      include: { notifications: true },
    });
    if (!prisma_user) throw new NotFoundException('User not found');
    const notif = prisma_user.notifications;
    return notif.filter((notif) => notif.type == type);
  }
}
