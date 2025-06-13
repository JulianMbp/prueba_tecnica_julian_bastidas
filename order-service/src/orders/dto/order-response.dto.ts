import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from './update-order-status.dto';

export class OrderItemResponseDto {
  @ApiProperty({
    description: 'ID del item',
    example: 'item-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'ID del producto',
    example: 'product-uuid-123',
  })
  productId: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 29.99,
  })
  price: number;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2023-12-06T10:30:00Z',
  })
  createdAt: Date;
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'ID del pedido',
    example: 'order-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario',
    example: 'user-uuid-123',
  })
  userId: string;

  @ApiProperty({
    description: 'Estado del pedido',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Monto total del pedido',
    example: 59.98,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Items del pedido',
    type: [OrderItemResponseDto],
  })
  orderItems: OrderItemResponseDto[];

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2023-12-06T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2023-12-06T10:30:00Z',
  })
  updatedAt: Date;
}
