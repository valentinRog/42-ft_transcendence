import {
  Injectable,
  UploadedFile,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
import { createWriteStream } from 'fs';
import { HttpService } from '@nestjs/axios';
import UPLOAD_PATH from '../../config/upload-path';
import * as fs from 'fs';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async editUser(userId: number, dto: EditUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          ...dto,
        },
      });
      delete user.hash;
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findUser(login: string) {
    return this.prisma.user.findUnique({ where: { login: login } });
  }

  async findFriend(username: string, friendId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { username: username },
    });
    return user.friends.includes(friendId);
  }

  async addFriend(userName: string, friendId: number) {
    if (await this.findFriend(userName, friendId)) {
      throw new ForbiddenException('User already in friends list');
    }
    try {
      const user = await this.prisma.user.update({
        where: { username: userName },
        data: { friends: { push: friendId } },
      });
      await this.prisma.user.update({
        where: { id: friendId },
        data: { friends: { push: user.id } },
      });
      delete user.hash;
      return user;
    } catch (error) {
      throw error;
    }
  }

  async removeFriend(userName: string, friendId: number) {
    if (!(await this.findFriend(userName, friendId))) {
      throw new ForbiddenException('User not in friends list');
    }
    try {
      const user = await this.prisma.user.update({
        where: { username: userName },
        data: {
          friends: {
            set: (
              await this.prisma.user.findUnique({
                where: { username: userName },
                select: { friends: true },
              })
            ).friends.filter((id) => id !== friendId),
          },
        },
      });
      // Remove the user from the friend's friend list
      await this.prisma.user.update({
        where: { id: friendId },
        data: {
          friends: {
            set: (
              await this.prisma.user.findUnique({
                where: { id: friendId },
                select: { friends: true },
              })
            ).friends.filter((id) => id !== user.id),
          },
        },
      });
      delete user.hash;
      return user;
    } catch (error) {
      throw error;
    }
  }

  async saveImageFromUrl(url: string, fileName: string): Promise<string> {
    const fileNamePath = fileName + '.png';
    const writer = createWriteStream(UPLOAD_PATH + fileNamePath);
    const response = await this.httpService.axiosRef({
      url: url,
      method: 'GET',
      responseType: 'stream',
    });
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        resolve(fileNamePath);
      });
      writer.on('error', (error) => {
        console.error(`Error downloading image from ${url}:`, error);
        reject(`Failed to download image from ${url}`);
      });
    });
  }

  async saveImageFromBuffer(
    @UploadedFile() file: Express.Multer.File,
    fileName: string,
  ) {
    const fileNamePath = fileName;
    await fs.promises.writeFile(UPLOAD_PATH + fileNamePath, file.buffer);

    return {
      message: 'File uploaded successfully',
      file: {
        originalName: file.originalname,
        size: file.size,
        fileName: fileNamePath,
      },
    };
  }

  async getQueueUsers() {
    const users = await this.prisma.user.findMany({
      where: {
        status: 'queue',
      },
    });
    return users;
  }

  async updateUserStatus(username: string, status: string) {
    try {
      const user = await this.prisma.user.update({
        where: {
          username: username,
        },
        data: {
          status: status,
        },
      });

      if (!user) {
        throw new NotFoundException(
          `User with username '${username}' not found.`,
        );
      }
      delete user.hash;
      return user;
    } catch (error) {
      throw error;
    }
  }
}
