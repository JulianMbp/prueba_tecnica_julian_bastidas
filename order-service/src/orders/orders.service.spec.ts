import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserValidationService } from '../messaging/user-validation.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: jest.Mocked<PrismaService>;
  let userValidationService: jest.Mocked<UserValidationService>;

  const mockUser = {
    id: 'user-uuid-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER' as const,
  };

  const mockOrder = {
    id: 'order-uuid-123',
    userId: 'user-uuid-123',
    status: 'PENDING' as const,
    totalAmount: 59.98,
    createdAt: new Date(),
    updatedAt: new Date(),
    orderItems: [
      {
        id: 'item-uuid-123',
        productId: 'product-uuid-123',
        quantity: 2,
        price: 29.99,
        createdAt: new Date(),
      },
    ],
  };

  beforeEach(async () => {
    const mockPrismaService = {
      order: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    } as any;

    const mockUserValidationService = {
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UserValidationService,
          useValue: mockUserValidationService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);

    prismaService = module.get<jest.Mocked<PrismaService>>(PrismaService);

    userValidationService = module.get<jest.Mocked<UserValidationService>>(
      UserValidationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const createOrderDto: CreateOrderDto = {
      orderItems: [
        {
          productId: 'product-uuid-123',
          quantity: 2,
          price: 29.99,
        },
      ],
    };

    it('should successfully create an order', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      jest.spyOn(userValidationService, 'validateUser').mockResolvedValue({
        isValid: true,
        user: mockUser,
      });
      jest
        .spyOn(prismaService.order, 'create')
        .mockResolvedValue(mockOrder as any);

      // Act
      const result = await service.createOrder(userId, createOrderDto);

      // Assert
      expect(userValidationService.validateUser).toHaveBeenCalledWith(userId);
      expect(prismaService.order.create).toHaveBeenCalledWith({
        data: {
          userId,
          totalAmount: 59.98,
          status: 'PENDING',
          orderItems: {
            create: [
              {
                productId: 'product-uuid-123',
                quantity: 2,
                price: 29.99,
              },
            ],
          },
        },
        include: {
          orderItems: true,
        },
      });
      expect(result).toEqual({
        id: mockOrder.id,
        userId: mockOrder.userId,
        status: mockOrder.status,
        totalAmount: mockOrder.totalAmount,
        orderItems: mockOrder.orderItems,
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
      });
    });

    it('should throw BadRequestException when user is invalid', async () => {
      // Arrange
      const userId = 'invalid-user-id';
      jest.spyOn(userValidationService, 'validateUser').mockResolvedValue({
        isValid: false,
        error: 'Usuario no encontrado',
      });

      // Act & Assert
      await expect(service.createOrder(userId, createOrderDto)).rejects.toThrow(
        new BadRequestException('Usuario no válido'),
      );
      expect(userValidationService.validateUser).toHaveBeenCalledWith(userId);
      expect(prismaService.order.create).not.toHaveBeenCalled();
    });

    it('should calculate total amount correctly', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      const multiItemOrderDto: CreateOrderDto = {
        orderItems: [
          {
            productId: 'product-1',
            quantity: 2,
            price: 10.5,
          },
          {
            productId: 'product-2',
            quantity: 1,
            price: 25.0,
          },
        ],
      };
      const expectedTotal = 2 * 10.5 + 1 * 25.0; // 46.00

      jest.spyOn(userValidationService, 'validateUser').mockResolvedValue({
        isValid: true,
        user: mockUser,
      });
      const mockOrderWithTotal = {
        ...mockOrder,
        totalAmount: expectedTotal,
      };
      jest
        .spyOn(prismaService.order, 'create')
        .mockResolvedValue(mockOrderWithTotal as any);

      // Act
      await service.createOrder(userId, multiItemOrderDto);

      // Assert
      expect(prismaService.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: expectedTotal,
          }),
        }),
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      jest.spyOn(userValidationService, 'validateUser').mockResolvedValue({
        isValid: true,
        user: mockUser,
      });
      jest
        .spyOn(prismaService.order, 'create')
        .mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(service.createOrder(userId, createOrderDto)).rejects.toThrow(
        new BadRequestException('Error al crear el pedido'),
      );
    });
  });

  describe('findOrdersByUser', () => {
    it('should return orders for valid user', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      jest.spyOn(userValidationService, 'validateUser').mockResolvedValue({
        isValid: true,
        user: mockUser,
      });
      jest
        .spyOn(prismaService.order, 'findMany')
        .mockResolvedValue([mockOrder] as any);

      // Act
      const result = await service.findOrdersByUser(userId);

      // Assert
      expect(userValidationService.validateUser).toHaveBeenCalledWith(userId);
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { orderItems: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockOrder.id);
    });

    it('should throw BadRequestException for invalid user', async () => {
      // Arrange
      const userId = 'invalid-user-id';
      jest.spyOn(userValidationService, 'validateUser').mockResolvedValue({
        isValid: false,
        error: 'Usuario no encontrado',
      });

      // Act & Assert
      await expect(service.findOrdersByUser(userId)).rejects.toThrow(
        new BadRequestException('Usuario no válido'),
      );
      expect(prismaService.order.findMany).not.toHaveBeenCalled();
    });
  });
});
