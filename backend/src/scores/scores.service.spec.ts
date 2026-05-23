import { Test, TestingModule } from '@nestjs/testing';
import { ScoresService } from './scores.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ScoresService', () => {
  let service: ScoresService;
  let prisma: {
    score: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      score: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoresService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ScoresService>(ScoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call prisma.score.create', async () => {
      const createScoreDto = {
        value: 100,
        accuracy: 0.95,
        timeSpent: 45,
        gameId: 1,
      };
      await service.create(5, createScoreDto);

      expect(prisma.score.create).toHaveBeenCalledWith({
        data: {
          value: 100,
          accuracy: 0.95,
          timeSpent: 45,
          user: { connect: { id: 5 } },
          game: { connect: { id: 1 } },
        },
      });
    });
  });

  describe('getLeaderboard', () => {
    it('should call prisma.score.findMany with order and take 10', async () => {
      await service.getLeaderboard(1);

      expect(prisma.score.findMany).toHaveBeenCalledWith({
        where: { gameId: 1 },
        orderBy: { value: 'desc' },
        take: 10,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      });
    });
  });

  describe('getMyHighScores', () => {
    it('should call prisma.score.findMany with distinct and order by value desc', async () => {
      await service.getMyHighScores(5);

      expect(prisma.score.findMany).toHaveBeenCalledWith({
        where: { userId: 5 },
        orderBy: { value: 'desc' },
        distinct: ['gameId'],
        include: {
          game: {
            select: { title: true },
          },
        },
      });
    });
  });
});
