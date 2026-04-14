import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScoreDto } from './dto/create-score.dto';

@Injectable()
export class ScoresService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createScoreDto: CreateScoreDto) {
    return this.prisma.score.create({
      data: {
        value: createScoreDto.value,
        accuracy: createScoreDto.accuracy,
        timeSpent: createScoreDto.timeSpent,
        user: { connect: { id: userId } },
        game: { connect: { id: createScoreDto.gameId } },
      },
    });
  }

  async getLeaderboard(gameId: number) {
    return this.prisma.score.findMany({
      where: { gameId },
      orderBy: { value: 'desc' },
      take: 10,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
  }

  async getMyHighScores(userId: number) {
    return this.prisma.score.findMany({
      where: { userId },
      orderBy: { value: 'desc' },
      distinct: ['gameId'],
      include: {
        game: {
          select: { title: true }
        }
      }
    });
  }
}
