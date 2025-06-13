import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROCESS = 'IN_PROCESS',
  COMPLETED = 'COMPLETED',
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del pedido',
    enum: OrderStatus,
    example: OrderStatus.IN_PROCESS,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
