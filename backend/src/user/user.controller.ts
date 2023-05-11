import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  ForbiddenException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService, private prisma: PrismaClient) {}

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);

    this.userService.saveImageFromBuffer(file, file.originalname);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('upload/pass-validation')
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
  async addFriend(@GetUser('username') userName, @Body() friendBody) {
    if (userName == friendBody.friend)
      throw new ForbiddenException('You cannot add yourself as a friend');
    const prisma_friend = await this.prisma.user.findUnique({
      where: { username: friendBody.friend },
    });
    if (!prisma_friend) throw new ForbiddenException('User not found');

    return this.userService.addFriend(userName, prisma_friend.id);
  }

  @Patch('remove-friend')
  async removeFriend(@GetUser('username') userName, @Body() friendBody) {
    if (userName == friendBody.friend)
      throw new ForbiddenException('You cannot remove yourself as a friend');
    const prisma_friend = await this.prisma.user.findUnique({
      where: { username: friendBody.friend },
    });
    if (!prisma_friend) throw new ForbiddenException('User not found');

    return this.userService.removeFriend(userName, prisma_friend.id);
  }
}
