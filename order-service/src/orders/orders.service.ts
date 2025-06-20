import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserValidationService } from '../messaging/user-validation.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import {
  OrderStatus,
  UpdateOrderStatusDto,
} from './dto/update-order-status.dto';
import {
  IOrderRepository,
  OrderWithItems,
} from './interfaces/order-repository.interface';
import { IOrderService } from './interfaces/order-service.interface';

@Injectable()
export class OrdersService implements IOrderService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    private readonly userValidationService: UserValidationService,
  ) {}

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    this.logger.log(`Creating order for user: ${userId}`);

    // Validar usuario con RabbitMQ
    const userValidation =
      await this.userValidationService.validateUser(userId);
    if (!userValidation.isValid) {
      throw new BadRequestException('Usuario no válido');
    }

    // Calcular el monto total
    const totalAmount = createOrderDto.orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    const order = await this.orderRepository.create(
      userId,
      createOrderDto,
      totalAmount,
    );
    return this.mapToOrderResponse(order, userValidation.user);
  }

  async findOrdersByUser(userId: string): Promise<OrderResponseDto[]> {
    this.logger.log(`Finding orders for user: ${userId}`);

    // Validar usuario con RabbitMQ
    const userValidation =
      await this.userValidationService.validateUser(userId);
    if (!userValidation.isValid) {
      throw new BadRequestException('Usuario no válido');
    }

    const orders = await this.orderRepository.findByUserId(userId);
    return orders.map((order) =>
      this.mapToOrderResponse(order, userValidation.user),
    );
  }

  async findAllOrders(): Promise<OrderResponseDto[]> {
    this.logger.log('Finding all orders (admin request)');

    const orders = await this.orderRepository.findAll();
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        const userValidation = await this.userValidationService.validateUser(
          order.userId,
        );
        return this.mapToOrderResponse(order, userValidation.user);
      }),
    );
    return ordersWithUsers;
  }

  async updateOrderStatus(
    orderId: string,
    userId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    this.logger.log(
      `Updating order ${orderId} status to ${updateOrderStatusDto.status}`,
    );

    // Validar usuario con RabbitMQ
    const userValidation =
      await this.userValidationService.validateUser(userId);
    if (!userValidation.isValid) {
      throw new BadRequestException('Usuario no válido');
    }

    // NUEVA VALIDACIÓN: Solo ADMIN puede aprobar pedidos (cambiar a IN_PROCESS o COMPLETED)
    if (userValidation.user?.role !== 'ADMIN') {
      if (
        updateOrderStatusDto.status === OrderStatus.IN_PROCESS ||
        updateOrderStatusDto.status === OrderStatus.COMPLETED
      ) {
        throw new BadRequestException(
          'Solo los administradores pueden aprobar o procesar pedidos',
        );
      }
    }

    let existingOrder: OrderWithItems | null = null;

    // Si es ADMIN, puede actualizar cualquier orden
    if (userValidation.user?.role === 'ADMIN') {
      // Para ADMIN: buscar orden por ID solamente
      existingOrder = await this.orderRepository.findById(orderId);
    } else {
      // Para usuarios normales: verificar que el pedido existe y pertenece al usuario
      existingOrder = await this.orderRepository.findByIdAndUserId(
        orderId,
        userId,
      );
    }

    if (!existingOrder) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Validar transición de estado
    this.validateStatusTransition(
      existingOrder.status as OrderStatus,
      updateOrderStatusDto.status,
      userValidation.user?.role,
    );

    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      updateOrderStatusDto.status,
    );

    // Para actualizaciones, obtener la información del usuario de la orden
    let orderUserValidation = userValidation;
    if (
      userValidation.user?.role === 'ADMIN' &&
      existingOrder.userId !== userId
    ) {
      // Si es admin actualizando la orden de otro usuario, obtener datos del usuario de la orden
      orderUserValidation = await this.userValidationService.validateUser(
        existingOrder.userId,
      );
    }

    return this.mapToOrderResponse(updatedOrder, orderUserValidation.user);
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
    userRole?: string,
  ): void {
    // Definir transiciones permitidas por rol
    const adminTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.IN_PROCESS, OrderStatus.COMPLETED],
      [OrderStatus.IN_PROCESS]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [], // No se puede cambiar desde completado
    };

    const userTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [], // Los usuarios normales no pueden cambiar estados
      [OrderStatus.IN_PROCESS]: [],
      [OrderStatus.COMPLETED]: [],
    };

    const validTransitions =
      userRole === 'ADMIN' ? adminTransitions : userTransitions;

    if (!validTransitions[currentStatus].includes(newStatus)) {
      if (userRole !== 'ADMIN') {
        throw new BadRequestException(
          'Solo los administradores pueden cambiar el estado de los pedidos',
        );
      } else {
        throw new BadRequestException(
          `No se puede cambiar el estado de ${currentStatus} a ${newStatus}`,
        );
      }
    }
  }

  private mapToOrderResponse(
    order: OrderWithItems,
    user?: { id: string; email: string; name: string; role: string },
  ): OrderResponseDto {
    return {
      id: order.id,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        : {
            id: order.userId,
            name: 'Usuario no encontrado',
            email: 'N/A',
            role: 'N/A',
          },
      status: order.status as OrderStatus,
      totalAmount: order.totalAmount,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        createdAt: item.createdAt,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
