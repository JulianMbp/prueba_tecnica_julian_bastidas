import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderStatus } from '../dto/update-order-status.dto';
import {
  IOrderRepository,
  OrderWithItems,
} from '../interfaces/order-repository.interface';

@Injectable()
export class OrderRepository implements IOrderRepository {
  private readonly logger = new Logger(OrderRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createOrderDto: CreateOrderDto,
    totalAmount: number,
  ): Promise<OrderWithItems> {
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
      return order as OrderWithItems;
    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw new BadRequestException('Error al crear el pedido');
    }
  }

  async findByUserId(userId: string): Promise<OrderWithItems[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders as OrderWithItems[];
  }

  async findAll(): Promise<OrderWithItems[]> {
    const orders = await this.prisma.order.findMany({
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders as OrderWithItems[];
  }

  async findById(orderId: string): Promise<OrderWithItems | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    return order as OrderWithItems | null;
  }

  async findByIdAndUserId(
    orderId: string,
    userId: string,
  ): Promise<OrderWithItems | null> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        orderItems: true,
      },
    });

    return order as OrderWithItems | null;
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<OrderWithItems> {
    try {
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          orderItems: true,
        },
      });

      this.logger.log(`Order ${orderId} status updated successfully`);
      return updatedOrder as OrderWithItems;
    } catch (error) {
      this.logger.error('Error updating order status:', error);
      throw new BadRequestException('Error al actualizar el estado del pedido');
    }
  }
}
