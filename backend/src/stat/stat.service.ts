import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateStatDto } from './dto';

@Injectable()
export class StatService {
  constructor(private prisma: PrismaClient) {}

  updateElo(result: number, playerA: number, playerB: number): number {
    const kFactor = 32; // The K-factor determines how much a player's rating will change after a game
    // Calculate the expected scores of player A
    const expectedScoreA = 1 / (1 + Math.pow(10, (playerB - playerA) / 400));
    // Calculate the new rating for both players
    const ratingDifference = playerB - playerA;
    const changeInRatingA = kFactor * (result - expectedScoreA);
    const newRatingA = playerA + changeInRatingA * (ratingDifference / 400);
    return Math.round(newRatingA);
  }

  async updateStat(userId: number, dto: UpdateStatDto) {
    const playerA = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { stat: true },
    });
    const playerB = await this.prisma.user.findUnique({
      where: { username: dto.opponentName },
      include: { stat: true },
    });

    playerA.stat.elo = this.updateElo(
      dto.result,
      playerA.stat.elo,
      playerB.stat.elo,
    );

    if (dto.result === 1) playerA.stat.wins += 1;
    else playerA.stat.losses += 1;

    const updatedStat = await this.prisma.stat.update({
      where: { id: playerA.stat.id },
      data: {
        ...playerA.stat,
      },
    });

    //only the winner creates the match record
    if (dto.result === 1) {
      const match = await this.prisma.match.create({
        data: {
          winnerId: userId,
          loserId: playerB.id,
        },
      });
      await this.prisma.user.update({
        where: { id: userId },
        data: { matchesAsWinner: { connect: { id: match.id } } },
      });
      await this.prisma.user.update({
        where: { username: dto.opponentName },
        data: { matchesAsLoser: { connect: { id: match.id } } },
      });
    }
    return updatedStat;
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
      console.error('Error retrieving matches:', error);
      throw error;
    }
  }
}
