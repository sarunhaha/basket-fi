import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import { ethers } from 'ethers';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateWalletSignature', () => {
    it('should validate a correct wallet signature', async () => {
      const wallet = ethers.Wallet.createRandom();
      const message = 'Sign in to Basket.fi';
      const signature = await wallet.signMessage(message);

      const result = await service.validateWalletSignature(
        wallet.address,
        signature,
        message,
      );

      expect(result).toBe(true);
    });

    it('should reject an incorrect signature', async () => {
      const wallet = ethers.Wallet.createRandom();
      const message = 'Sign in to Basket.fi';
      const wrongSignature = 'invalid_signature';

      const result = await service.validateWalletSignature(
        wallet.address,
        wrongSignature,
        message,
      );

      expect(result).toBe(false);
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'user_123',
      walletAddress: '0x123...',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should login existing user with valid signature', async () => {
      const wallet = ethers.Wallet.createRandom();
      const message = 'Sign in to Basket.fi';
      const signature = await wallet.signMessage(message);

      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        walletAddress: wallet.address,
      });
      mockJwtService.sign.mockReturnValue('access_token');

      const result = await service.login({
        walletAddress: wallet.address,
        signature,
        message,
      });

      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'access_token',
        user: expect.objectContaining({
          walletAddress: wallet.address,
        }),
      });
    });

    it('should create new user if not exists', async () => {
      const wallet = ethers.Wallet.createRandom();
      const message = 'Sign in to Basket.fi';
      const signature = await wallet.signMessage(message);

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        walletAddress: wallet.address,
      });
      mockJwtService.sign.mockReturnValue('access_token');

      const result = await service.login({
        walletAddress: wallet.address,
        signature,
        message,
      });

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          walletAddress: wallet.address,
        },
      });
      expect(result.user.walletAddress).toBe(wallet.address);
    });

    it('should throw UnauthorizedException for invalid signature', async () => {
      const loginDto = {
        walletAddress: '0x123...',
        signature: 'invalid_signature',
        message: 'Sign in to Basket.fi',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh valid token', async () => {
      const payload = { sub: 'user_123', walletAddress: '0x123...' };
      mockJwtService.verify.mockReturnValue(payload);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new_access_token');

      const result = await service.refreshToken('valid_refresh_token');

      expect(result).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_access_token',
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});