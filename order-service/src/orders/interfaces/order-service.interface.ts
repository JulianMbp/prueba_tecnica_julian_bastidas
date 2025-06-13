import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';

export interface IOrderService {
  createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto>;
  findOrdersByUser(userId: string): Promise<OrderResponseDto[]>;
  findAllOrders(): Promise<OrderResponseDto[]>;
  updateOrderStatus(
    orderId: string,
    userId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto>;
}
