import {
  Body,
  Controller,
  Patch,
  UseGuards,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto, FriendDto } from './dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaClient } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService, private prisma: PrismaClient) {}

  @Get('me')
  getMe(@GetUser() user) {
    return user;
  }

  @Get('info/:id')
  getInfo(@Param('id') id: number) {
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  @UseGuards(JwtGuard)
  @Get('me/friends')
  async getUserFriends(@GetUser() user) {
    try {
      const friends = await this.prisma.user.findMany({
        where: { id: { in: user.friends } },
      });
      return friends;
    } catch (error) {
      throw new NotFoundException('friends not found or empty');
    }
  }

  @Patch('edit')
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  uploadFileAndPassValidation(
    @GetUser('login') login,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.saveImageFromBuffer(file, login + '.png');
  }

  @Patch('add-friend')
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

  @Patch('remove-friend')
  async removeFriend(@GetUser('username') username, @Body() dto: FriendDto) {
    if (username == dto.friend)
      throw new ForbiddenException('You cannot remove yourself as a friend');
    const prisma_friend = await this.prisma.user.findUnique({
      where: { username: dto.friend },
    });
    if (!prisma_friend) throw new ForbiddenException('User not found');

    return this.userService.removeFriend(username, prisma_friend.id);
  }
}
