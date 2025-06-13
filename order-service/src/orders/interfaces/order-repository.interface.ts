import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderStatus } from '../dto/update-order-status.dto';

export interface IOrderRepository {
  create(
    userId: string,
    createOrderDto: CreateOrderDto,
    totalAmount: number,
  ): Promise<OrderWithItems>;
  findByUserId(userId: string): Promise<OrderWithItems[]>;
  findAll(): Promise<OrderWithItems[]>;
  findById(orderId: string): Promise<OrderWithItems | null>;
  findByIdAndUserId(
    orderId: string,
    userId: string,
  ): Promise<OrderWithItems | null>;
  updateStatus(orderId: string, status: OrderStatus): Promise<OrderWithItems>;
}

export interface OrderWithItems {
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
