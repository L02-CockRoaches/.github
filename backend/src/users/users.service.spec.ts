import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should call prisma.user.findUnique', async () => {
      const email = 'test@example.com';
      await service.findOne(email);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  describe('create', () => {
    it('should call prisma.user.create with the provided payload', async () => {
      const userData = {
        email: 'new-user@example.com',
        password: 'hashed-password',
        name: 'New User',
      };

      await service.create(userData);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
    });
  });
});
