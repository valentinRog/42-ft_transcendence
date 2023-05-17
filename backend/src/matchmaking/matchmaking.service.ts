import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchmakingService {
  constructor(private prisma: PrismaService) {}

  async queue(userId: number) {
    // update user status to queue
    const user = this.prisma.user.update({
      where: { id: userId },
      data: { status: 'queue' },
    });
    return user;
  }
}
