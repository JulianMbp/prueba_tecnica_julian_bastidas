import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserValidationService } from '../messaging/user-validation.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { IOrderRepository } from './interfaces/order-repository.interface';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: jest.Mocked<IOrderRepository>;
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
    const mockOrderRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      findByIdAndUserId: jest.fn(),
      updateStatus: jest.fn(),
    };

    const mockUserValidationService = {
      validateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: 'IOrderRepository',
          useValue: mockOrderRepository,
        },
        {
          provide: UserValidationService,
          useValue: mockUserValidationService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository =
      module.get<jest.Mocked<IOrderRepository>>('IOrderRepository');
    userValidationService = module.get<jest.Mocked<UserValidationService>>(
      UserValidationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllOrders', () => {
    it('should return all orders for admin', async () => {
      // Arrange
      const mockOrders = [mockOrder, { ...mockOrder, id: 'order-uuid-456' }];
      orderRepository.findAll.mockResolvedValue(mockOrders);

      // Act
      const result = await service.findAllOrders();

      // Assert
      expect(orderRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: mockOrder.id,
        userId: mockOrder.userId,
        status: mockOrder.status,
        totalAmount: mockOrder.totalAmount,
        orderItems: mockOrder.orderItems,
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
      });
    });

    it('should return empty array when no orders exist', async () => {
      // Arrange
      orderRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.findAllOrders();

      // Assert
      expect(result).toEqual([]);
    });
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
      userValidationService.validateUser.mockResolvedValue({
        isValid: true,
        user: mockUser,
      });
      orderRepository.create.mockResolvedValue(mockOrder);

      // Act
      const result = await service.createOrder(userId, createOrderDto);

      // Assert
      expect(userValidationService.validateUser).toHaveBeenCalledWith(userId);
      expect(orderRepository.create).toHaveBeenCalledWith(
        userId,
        createOrderDto,
        59.98,
      );
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
      userValidationService.validateUser.mockResolvedValue({
        isValid: false,
        error: 'Usuario no encontrado',
      });

      // Act & Assert
      await expect(service.createOrder(userId, createOrderDto)).rejects.toThrow(
        new BadRequestException('Usuario no válido'),
      );
      expect(userValidationService.validateUser).toHaveBeenCalledWith(userId);
      expect(orderRepository.create).not.toHaveBeenCalled();
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

      userValidationService.validateUser.mockResolvedValue({
        isValid: true,
        user: mockUser,
      });
      const mockOrderWithTotal = {
        ...mockOrder,
        totalAmount: expectedTotal,
      };
      orderRepository.create.mockResolvedValue(mockOrderWithTotal);

      // Act
      await service.createOrder(userId, multiItemOrderDto);

      // Assert
      expect(orderRepository.create).toHaveBeenCalledWith(
        userId,
        multiItemOrderDto,
        expectedTotal,
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      userValidationService.validateUser.mockResolvedValue({
        isValid: true,
        user: mockUser,
      });
      orderRepository.create.mockRejectedValue(
        new Error('Database connection failed'),
      );

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
      const mockOrders = [mockOrder];
      userValidationService.validateUser.mockResolvedValue({
        isValid: true,
        user: mockUser,
      });
      orderRepository.findByUserId.mockResolvedValue(mockOrders);

      // Act
      const result = await service.findOrdersByUser(userId);

      // Assert
      expect(userValidationService.validateUser).toHaveBeenCalledWith(userId);
      expect(orderRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockOrder.id,
        userId: mockOrder.userId,
        status: mockOrder.status,
        totalAmount: mockOrder.totalAmount,
        orderItems: mockOrder.orderItems,
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
      });
    });

    it('should throw BadRequestException for invalid user', async () => {
      // Arrange
      const userId = 'invalid-user-id';
      userValidationService.validateUser.mockResolvedValue({
        isValid: false,
        error: 'Usuario no encontrado',
      });

      // Act & Assert
      await expect(service.findOrdersByUser(userId)).rejects.toThrow(
        new BadRequestException('Usuario no válido'),
      );
      expect(userValidationService.validateUser).toHaveBeenCalledWith(userId);
      expect(orderRepository.findByUserId).not.toHaveBeenCalled();
    });
  });
});
