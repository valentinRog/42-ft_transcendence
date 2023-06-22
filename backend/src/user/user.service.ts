import {
  Injectable,
  UploadedFile,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
import { WebSocketService } from '../websocket/websocket.service';
import { createWriteStream } from 'fs';
import { HttpService } from '@nestjs/axios';
import UPLOAD_PATH from '../../config/upload-path';
import * as fs from 'fs';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private socketService: WebSocketService,
  ) {}

  async getUser(username: string) {
    return this.prisma.user.findUnique({ where: { username: username } });
  }

  async getUserById(userId: number) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

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
      throw new NotFoundException(`User with id '${userId}' not found.`);
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
      const friend = await this.prisma.user.update({
        where: { id: friendId },
        data: { friends: { push: user.id } },
      });
      if ((await this.getUserStatus(friend.username)) != 'offline') {
        this.socketService.sendToUser(friend.username, userName, 'friend');
      }
      delete user.hash;
      return user;
    } catch (error) {
      throw new ForbiddenException('Fail to update in database');
    }
  }

  async getUserStatus(username: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username: username },
      });
      return this.socketService.getStatus(user.username);
    } catch (error) {
      throw new NotFoundException(
        `User with username '${username}' not found.`,
      );
    }
  }

  async removeFriend(userName: string, friendId: number) {
    if (!(await this.findFriend(userName, friendId))) {
      throw new NotFoundException('User not in friends list');
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
      const friend = await this.prisma.user.update({
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
      if ((await this.getUserStatus(friend.username)) != 'offline') {
        this.socketService.sendToUser(friend.username, userName, 'friend');
      }
      delete user.hash;
      return user;
    } catch (error) {
      throw new ForbiddenException('Fail to update in database');
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
    const inqueue = [...this.socketService.getAllStatus().entries()]
      .filter(([_, status]) => status === 'queue')
      .map(([username, _]) => username);
    const users = await this.prisma.user.findMany({
      where: {
        username: {
          in: inqueue,
        },
      },
    });
    return users;
  }

  getStatus(username: string) {
    return this.socketService.getStatus(username);
  }

  async blockUser(userId: number, blockedId: number) {
  //   return this.prisma.block.create({
  //     data: {
  //       blockerId: userId,
  //       blockedId: blockedId,
  //     },
  //   });
  }
}
