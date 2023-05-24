import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { ForbiddenException } from '@nestjs/common';
import { FriendDto } from 'src/user/dto';
import { UserService } from 'src/user/user.service';
import { PrismaClient } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('notification')
export class NotificationController {
  constructor(private userService: UserService, private prisma: PrismaClient) {}

  @Post('add-friend')
  async addFriend(@GetUser('username') username, @Body() dto: FriendDto) {
    if (username == dto.friend)
      throw new ForbiddenException('You cannot add yourself as a friend');
    const prisma_friend = await this.prisma.user.findUnique({
      where: { username: dto.friend },
    });
    if (!prisma_friend) throw new ForbiddenException('User not found');

    this.userService.notifyEvent(prisma_friend.username, username, 'addfriend');
    //return this.userService.addFriend(username, prisma_friend.id);
  }
}
