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
    return this.mapToOrderResponse(order);
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
    return orders.map((order) => this.mapToOrderResponse(order));
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

    // Verificar que el pedido existe y pertenece al usuario
    const existingOrder = await this.orderRepository.findByIdAndUserId(
      orderId,
      userId,
    );

    if (!existingOrder) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Validar transición de estado
    this.validateStatusTransition(
      existingOrder.status as OrderStatus,
      updateOrderStatusDto.status,
    );

    const updatedOrder = await this.orderRepository.updateStatus(
      orderId,
      updateOrderStatusDto.status,
    );
    return this.mapToOrderResponse(updatedOrder);
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.IN_PROCESS, OrderStatus.COMPLETED],
      [OrderStatus.IN_PROCESS]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [], // No se puede cambiar desde completado
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${currentStatus} a ${newStatus}`,
      );
    }
  }

  private mapToOrderResponse(order: OrderWithItems): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
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
