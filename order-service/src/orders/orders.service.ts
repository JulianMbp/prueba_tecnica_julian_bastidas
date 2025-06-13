import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserValidationService } from '../messaging/user-validation.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import {
  OrderStatus,
  UpdateOrderStatusDto,
} from './dto/update-order-status.dto';

interface OrderWithItems {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  orderItems: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    createdAt: Date;
  }>;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
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

    try {
      const order = await this.prisma.order.create({
        data: {
          userId,
          totalAmount,
          status: 'PENDING',
          orderItems: {
            create: createOrderDto.orderItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      this.logger.log(`Order created successfully: ${order.id}`);
      return this.mapToOrderResponse(order);
    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw new BadRequestException('Error al crear el pedido');
    }
  }

  async findOrdersByUser(userId: string): Promise<OrderResponseDto[]> {
    this.logger.log(`Finding orders for user: ${userId}`);

    // Validar usuario con RabbitMQ
    const userValidation =
      await this.userValidationService.validateUser(userId);
    if (!userValidation.isValid) {
      throw new BadRequestException('Usuario no válido');
    }

    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

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
    const existingOrder = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!existingOrder) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Validar transición de estado
    this.validateStatusTransition(
      existingOrder.status as OrderStatus,
      updateOrderStatusDto.status,
    );

    try {
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { status: updateOrderStatusDto.status },
        include: {
          orderItems: true,
        },
      });

      this.logger.log(`Order ${orderId} status updated successfully`);
      return this.mapToOrderResponse(updatedOrder);
    } catch (error) {
      this.logger.error('Error updating order status:', error);
      throw new BadRequestException('Error al actualizar el estado del pedido');
    }
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
