import { Controller, Post, UseGuards, Body, Get, Query } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FriendDto } from 'src/user/dto';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notification.service';
import { ResponseDto } from './dto';
import { UserService } from 'src/user/user.service';

@UseGuards(JwtGuard)
@Controller('notification')
export class NotificationController {
  constructor(
    private prisma: PrismaClient,
    private notifService: NotificationService,
    private userService: UserService,
  ) {}

  @Post('add-friend')
  async addFriend(@GetUser('id') id, @Body() dto: FriendDto) {
    if (id == dto.friendId)
      throw new ForbiddenException('You cannot add yourself as a friend');
    const prisma_friend = await this.prisma.user.findUnique({
      where: { id: dto.friendId },
    });
    if (!prisma_friend) throw new NotFoundException('User not found');
    if (await this.userService.findFriend(id, prisma_friend.id)) {
      throw new ForbiddenException('You are already friends');
    }
    return await this.notifService.notifyEvent(prisma_friend, id, 'friend');
  }

  @Post('friend-response')
  async responseFriend(@GetUser('id') id, @Body() dto: ResponseDto) {
    await this.notifService.removeNotification(dto.friendId, 'friend');
    if (dto.response) {
      if (id == dto.friendId)
        throw new ForbiddenException('You cannot add yourself as a friend');
      const prisma_friend = await this.prisma.user.findUnique({
        where: { username: dto.friendId },
      });
      if (!prisma_friend) throw new NotFoundException('User not found');
      return await this.userService.addFriend(id, prisma_friend.id);
    }
    return { message: 'declined' };
  }

  @Post('ask-game')
  async match(@GetUser('id') id, @Body() dto: FriendDto) {
    if (id == dto.friendId)
      throw new ForbiddenException('You cannot match yourself');
    const prisma_friend = await this.prisma.user.findUnique({
      where: { id: dto.friendId },
    });
    if (!prisma_friend) throw new NotFoundException('User not found');
    return await this.notifService.notifyEvent(prisma_friend, id, 'game');
  }

  @Get('get')
  async getNotifFriend(@GetUser('id') id, @Query('type') type: string) {
    const prisma_user = await this.prisma.user.findUnique({
      where: { id: id },
      include: { notifications: true },
    });
    if (!prisma_user) throw new NotFoundException('User not found');
    const notif = prisma_user.notifications;
    return notif.filter((notif) => notif.type == type);
  }
}
