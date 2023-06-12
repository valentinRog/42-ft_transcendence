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
  Param,
  StreamableFile,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto, FriendDto } from './dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaClient } from '@prisma/client';
import { createReadStream } from 'fs';
import { join } from 'path';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService, private prisma: PrismaClient) {}

  @Get('me')
  getMe(@GetUser() user) {
    return user;
  }

  @Get('avatar/me')
  getMyPhoto(@GetUser() user) {
    const file = createReadStream(
      join(process.cwd(), '/upload', `${user.login}.png`),
    );
    return new StreamableFile(file);
  }

  @Get('info/:id')
  getInfo(@Param('id') id: string) {
    const parseId = parseInt(id.toString());
    return this.prisma.user.findUnique({ where: { id: parseId } });
  }

  @Get('avatar/:login')
  async getUserPhoto(@Param('login') login: string) {
    const user = await this.userService.getUser(login);
    const file = createReadStream(
      join(process.cwd(), '/upload', `${user.login}.png`),
    );
    return new StreamableFile(file);
  }

  @UseGuards(JwtGuard)
  @Get('me/friends')
  async getUserFriends(@GetUser() user) {
    const friends = await this.prisma.user.findMany({
      where: { id: { in: user.friends } },
    });
    return friends;
  }

  @Patch('edit')
  asynceditUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
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

  @Patch('remove-friend')
  async removeFriend(@GetUser('username') username, @Body() dto: FriendDto) {
    if (username == dto.friend)
      throw new ForbiddenException('You cannot remove yourself as a friend');
    const prisma_friend = await this.prisma.user.findUnique({
      where: { username: dto.friend },
    });
    if (!prisma_friend) throw new ForbiddenException('User not found');

    return await this.userService.removeFriend(username, prisma_friend.id);
  }

//  @Post('add-friend')
//  async addFriend(@GetUser('username') username, @Body() dto: FriendDto) {
//    if (username == dto.friend)
//      throw new ForbiddenException('You cannot add yourself as a friend');
//    const prisma_friend = await this.prisma.user.findUnique({
//      where: { username: dto.friend },
//    });
//    if (!prisma_friend) throw new ForbiddenException('User not found');
//    return await this.userService.addFriend(username, prisma_friend.id);
//  }
}
