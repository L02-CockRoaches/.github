import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findOne: jest.Mock;
    create: jest.Mock;
  };
  let jwtService: {
    sign: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should throw ConflictException if user already exists', async () => {
      usersService.findOne.mockResolvedValue({ id: 1, email: 'exist@test.com' });

      await expect(
        service.signup({ email: 'exist@test.com', password: 'password', name: 'Test' }),
      ).rejects.toThrow(ConflictException);

      expect(usersService.findOne).toHaveBeenCalledWith('exist@test.com');
    });

    it('should create user and hash password if signup is valid', async () => {
      usersService.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass');
      usersService.create.mockResolvedValue({ id: 123 });

      const res = await service.signup({
        email: 'new@test.com',
        password: 'password',
        name: 'New User',
      });

      expect(res).toEqual({ message: 'Đăng ký thành công!', userId: 123 });
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: 'hashed-pass',
        name: 'New User',
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password incorrect', async () => {
      usersService.findOne.mockResolvedValue({ id: 1, email: 'user@test.com', password: 'hashed-password' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'user@test.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token if credentials are valid', async () => {
      usersService.findOne.mockResolvedValue({
        id: 1,
        email: 'user@test.com',
        password: 'hashed-password',
        name: 'Test Name',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const res = await service.login({ email: 'user@test.com', password: 'password' });

      expect(res).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'user@test.com',
          name: 'Test Name',
        },
      });
    });
  });

  describe('googleLogin', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should throw ConflictException if GOOGLE_CLIENT_ID not set', async () => {
      delete process.env.GOOGLE_CLIENT_ID;

      await expect(service.googleLogin({ idToken: 'token' })).rejects.toThrow(ConflictException);
    });

    it('should verify token, create user if not exist, and return access token', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';

      const mockPayload = { email: 'google@test.com', name: 'Google Account' };
      const verifySpy = (jest.spyOn(OAuth2Client.prototype, 'verifyIdToken') as any).mockResolvedValue({
        getPayload: () => mockPayload,
      });

      usersService.findOne.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: 456,
        email: 'google@test.com',
        name: 'Google Account',
      });

      const res = await service.googleLogin({ idToken: 'some-id-token' });

      expect(res).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: 456,
          email: 'google@test.com',
          name: 'Google Account',
        },
      });
      expect(verifySpy).toHaveBeenCalledWith({
        idToken: 'some-id-token',
        audience: 'test-client-id',
      });
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'google@test.com',
        name: 'Google Account',
        password: 'GOOGLE_OAUTH_ACCOUNT',
      });
    });

    it('should verify token, return access token without creating user if user exists', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';

      const mockPayload = { email: 'google@test.com', name: 'Google Account' };
      (jest.spyOn(OAuth2Client.prototype, 'verifyIdToken') as any).mockResolvedValue({
        getPayload: () => mockPayload,
      });

      usersService.findOne.mockResolvedValue({
        id: 789,
        email: 'google@test.com',
        name: 'Google Account',
      });

      const res = await service.googleLogin({ idToken: 'some-id-token' });

      expect(res).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: 789,
          email: 'google@test.com',
          name: 'Google Account',
        },
      });
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if ticket payload is missing', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      (jest.spyOn(OAuth2Client.prototype, 'verifyIdToken') as any).mockResolvedValue({
        getPayload: () => null,
      });

      await expect(service.googleLogin({ idToken: 'token' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if email in payload is missing', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      (jest.spyOn(OAuth2Client.prototype, 'verifyIdToken') as any).mockResolvedValue({
        getPayload: () => ({ name: 'No Email User' }),
      });

      await expect(service.googleLogin({ idToken: 'token' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if verification throws error', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      (jest.spyOn(OAuth2Client.prototype, 'verifyIdToken') as any).mockRejectedValue(new Error('Invalid token signature'));

      await expect(service.googleLogin({ idToken: 'invalid-token' })).rejects.toThrow(UnauthorizedException);
    });
  });
});
