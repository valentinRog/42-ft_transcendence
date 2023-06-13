import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateStatDto } from './dto';
import { NotFoundException } from '@nestjs/common';
import Elo from '@studimax/elo';

@Injectable()
export class StatService {
  constructor(private prisma: PrismaClient) {}

  async updateStat(userId: number, dto: UpdateStatDto) {
    const playerA = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { stat: true },
    });
    const playerB = await this.prisma.user.findUnique({
      where: { username: dto.opponentName },
      include: { stat: true },
    });
    const elo = new Elo({ kFactor: 20 });
    const { Ra, Rb } = elo.calculateRating(
      playerA.stat.elo,
      playerB.stat.elo,
      dto.result,
    );
    playerA.stat.elo = Math.round(Ra);
    playerB.stat.elo = Math.round(Rb);
    if (dto.result === 1) {
      playerA.stat.wins += 1;
      playerB.stat.losses += 1;
    } else {
      playerA.stat.losses += 1;
      playerB.stat.wins += 1;
    }
    await this.prisma.stat.update({
      where: { id: playerA.stat.id },
      data: {
        ...playerA.stat,
      },
    });
    await this.prisma.stat.update({
      where: { id: playerB.stat.id },
      data: {
        ...playerB.stat,
      },
    });

    const winnerId = dto.result === 1 ? userId : playerB.id;
    const loserId = dto.result === 1 ? playerB.id : userId;
    const match = await this.prisma.match.create({
      data: {
        winnerId: winnerId,
        loserId: loserId,
      },
    });
    await this.prisma.user.update({
      where: { id: winnerId },
      data: { matchesAsWinner: { connect: { id: match.id } } },
    });
    await this.prisma.user.update({
      where: { id: loserId },
      data: { matchesAsLoser: { connect: { id: match.id } } },
    });
    return match;
  }

  async getHistory(playerId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: playerId },
        include: {
          matchesAsWinner: true,
          matchesAsLoser: true,
        },
      });
      // Merge the matches from both arrays into a single array
      const allMatches = [...user.matchesAsWinner, ...user.matchesAsLoser];
      // Sort the matches by date in descending order
      const sortedMatches = allMatches.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
      return sortedMatches;
    } catch (error) {
      throw new NotFoundException('Error retrieving matches');
    }
  }

  async getStats(playerId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: playerId },
        include: { stat: true },
      });
      return user.stat;
    } catch (error) {
      throw new NotFoundException('Error retrieving stats');
    }
  }
}
