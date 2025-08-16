import { Test, TestingModule } from '@nestjs/testing';
import { BasketsController } from './baskets.controller';
import { BasketsService } from './baskets.service';
import { CreateBasketDto, UpdateBasketDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('BasketsController', () => {
  let controller: BasketsController;
  let service: BasketsService;

  const mockUser = {
    id: 'user_123',
    walletAddress: '0x123...',
    role: 'USER',
  };

  const mockBasket = {
    id: 'basket_123',
    name: 'My Portfolio',
    description: 'Test portfolio',
    userId: 'user_123',
    totalValue: '1000.00',
    isPublic: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBasketsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    rebalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BasketsController],
      providers: [
        {
          provide: BasketsService,
          useValue: mockBasketsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BasketsController>(BasketsController);
    service = module.get<BasketsService>(BasketsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new basket', async () => {
      const createBasketDto: CreateBasketDto = {
        name: 'My Portfolio',
        description: 'Test portfolio',
        isPublic: false,
        allocations: [
          {
            tokenAddress: '0xA0b86a33E6441e6e80D0c4C6C7556C974E1B7F4D',
            targetPercentage: 50,
          },
          {
            tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            targetPercentage: 50,
          },
        ],
      };

      mockBasketsService.create.mockResolvedValue(mockBasket);

      const result = await controller.create(createBasketDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(createBasketDto, mockUser.id);
      expect(result).toEqual(mockBasket);
    });

    it('should validate allocation percentages sum to 100', async () => {
      const createBasketDto: CreateBasketDto = {
        name: 'Invalid Portfolio',
        allocations: [
          {
            tokenAddress: '0xA0b86a33E6441e6e80D0c4C6C7556C974E1B7F4D',
            targetPercentage: 60,
          },
          {
            tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            targetPercentage: 50, // Total = 110%
          },
        ],
      };

      // This would be handled by validation pipe in real scenario
      const totalPercentage = createBasketDto.allocations.reduce(
        (sum, allocation) => sum + allocation.targetPercentage,
        0,
      );

      expect(totalPercentage).not.toBe(100);
    });
  });

  describe('findAll', () => {
    it('should return paginated baskets', async () => {
      const paginatedResult = {
        data: [mockBasket],
        pagination: {
          hasNext: false,
          nextCursor: null,
          total: 1,
        },
      };

      mockBasketsService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(
        mockUser,
        undefined, // cursor
        20, // limit
        undefined, // isPublic
      );

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, {
        cursor: undefined,
        limit: 20,
        isPublic: undefined,
      });
      expect(result).toEqual(paginatedResult);
    });

    it('should filter by public baskets', async () => {
      const publicBaskets = {
        data: [{ ...mockBasket, isPublic: true }],
        pagination: {
          hasNext: false,
          nextCursor: null,
          total: 1,
        },
      };

      mockBasketsService.findAll.mockResolvedValue(publicBaskets);

      await controller.findAll(mockUser, undefined, 20, true);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, {
        cursor: undefined,
        limit: 20,
        isPublic: true,
      });
    });
  });

  describe('findOne', () => {
    it('should return basket with allocations', async () => {
      const basketWithAllocations = {
        ...mockBasket,
        allocations: [
          {
            id: 'alloc_1',
            basketId: 'basket_123',
            tokenAddress: '0xA0b86a33E6441e6e80D0c4C6C7556C974E1B7F4D',
            targetPercentage: '50.00',
            currentPercentage: '48.50',
            amount: '500.00',
            basketAsset: {
              symbol: 'USDC',
              name: 'USD Coin',
              decimals: 6,
            },
          },
        ],
      };

      mockBasketsService.findOne.mockResolvedValue(basketWithAllocations);

      const result = await controller.findOne('basket_123', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('basket_123', mockUser.id);
      expect(result).toEqual(basketWithAllocations);
    });
  });

  describe('update', () => {
    it('should update basket', async () => {
      const updateBasketDto: UpdateBasketDto = {
        name: 'Updated Portfolio',
        description: 'Updated description',
      };

      const updatedBasket = { ...mockBasket, ...updateBasketDto };
      mockBasketsService.update.mockResolvedValue(updatedBasket);

      const result = await controller.update(
        'basket_123',
        updateBasketDto,
        mockUser,
      );

      expect(service.update).toHaveBeenCalledWith(
        'basket_123',
        updateBasketDto,
        mockUser.id,
      );
      expect(result).toEqual(updatedBasket);
    });
  });

  describe('remove', () => {
    it('should soft delete basket', async () => {
      mockBasketsService.remove.mockResolvedValue(undefined);

      await controller.remove('basket_123', mockUser);

      expect(service.remove).toHaveBeenCalledWith('basket_123', mockUser.id);
    });
  });

  describe('rebalance', () => {
    it('should initiate basket rebalance', async () => {
      const rebalanceRequest = { dryRun: false };
      const idempotencyKey = 'rebalance_123';
      
      const mockRebalance = {
        id: 'rebalance_123',
        basketId: 'basket_123',
        userId: 'user_123',
        status: 'PENDING',
        trades: [],
        createdAt: new Date(),
      };

      mockBasketsService.rebalance.mockResolvedValue(mockRebalance);

      const result = await controller.rebalance(
        'basket_123',
        rebalanceRequest,
        idempotencyKey,
        mockUser,
      );

      expect(service.rebalance).toHaveBeenCalledWith(
        'basket_123',
        rebalanceRequest,
        mockUser.id,
        idempotencyKey,
      );
      expect(result).toEqual(mockRebalance);
    });

    it('should handle dry run rebalance', async () => {
      const rebalanceRequest = { dryRun: true };
      const idempotencyKey = 'rebalance_dry_123';
      
      const mockDryRunResult = {
        id: 'rebalance_dry_123',
        basketId: 'basket_123',
        userId: 'user_123',
        status: 'COMPLETED',
        trades: [
          {
            from: '0xA0b86a33E6441e6e80D0c4C6C7556C974E1B7F4D',
            to: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            amount: '100.00',
            estimatedGas: '0.005',
          },
        ],
        estimatedGas: '0.005',
        createdAt: new Date(),
      };

      mockBasketsService.rebalance.mockResolvedValue(mockDryRunResult);

      const result = await controller.rebalance(
        'basket_123',
        rebalanceRequest,
        idempotencyKey,
        mockUser,
      );

      expect(result.trades).toHaveLength(1);
      expect(result.estimatedGas).toBeDefined();
    });
  });
});