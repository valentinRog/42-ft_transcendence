import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MatchmakingService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async queue(userId: number) {
    // update user status to queue
    const user = this.prisma.user.update({
      where: { id: userId },
      data: { status: 'queue' },
    });
    return user;
  }

  async findOpponent() {
    const waitingUsers = await this.userService.getQueueUsers(); // Retrieve users in "waiting" status

    // Implement matchmaking logic and update user statuses accordingly
    // ...
    console.log(waitingUsers);
  }
}
