import { Controller, Post, UseGuards, Body, Get } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { ForbiddenException } from '@nestjs/common';
import { FriendDto } from 'src/user/dto';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notification.service';

@UseGuards(JwtGuard)
@Controller('notification')
export class NotificationController {
  constructor(
    private prisma: PrismaClient,
    private notifService: NotificationService,
  ) {}

  @Post('add-friend')
  async addFriend(@GetUser('username') username, @Body() dto: FriendDto) {
    if (username == dto.friend)
      throw new ForbiddenException('You cannot add yourself as a friend');
    const prisma_friend = await this.prisma.user.findUnique({
      where: { username: dto.friend },
    });
    if (!prisma_friend) throw new ForbiddenException('User not found');

    return await this.notifService.notifyEvent(
      prisma_friend.username,
      username,
      'addfriend',
    );
    //return this.userService.addFriend(username, prisma_friend.id);
  }

  @Post('match')
  async match(@GetUser('username') username, @Body() dto: FriendDto) {
    if (username == dto.friend)
      throw new ForbiddenException('You cannot match yourself');
    const prisma_friend = await this.prisma.user.findUnique({
      where: { username: dto.friend },
    });
    if (!prisma_friend) throw new ForbiddenException('User not found');

    return await this.notifService.notifyEvent(
      prisma_friend.username,
      username,
      'match',
    );
  }

  @Get('notifications')
  async getNotifications(@GetUser('username') username) {
    const prisma_user = await this.prisma.user.findUnique({
      where: { username: username },
      include: { notifications: true },
    });
    if (!prisma_user) throw new ForbiddenException('User not found');
    return prisma_user.notifications;
  }
}
