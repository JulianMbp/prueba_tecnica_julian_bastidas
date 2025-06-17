import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo pedido',
    description: 'Crea un nuevo pedido asociado al usuario autenticado',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pedido creado exitosamente',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o usuario no válido',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticación requerido',
  })
  async createOrder(
    @Request() req: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const userId = req.user.id;
    return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar pedidos',
    description: `
    Si es ADMIN obtiene todos los pedidos, 
    si es usuario normal solo los suyos
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de pedidos obtenida exitosamente',
    type: [OrderResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticación requerido',
  })
  async findOrders(
    @Request() req: AuthenticatedRequest,
  ): Promise<OrderResponseDto[]> {
    const { id: userId, role } = req.user;

    if (role === 'ADMIN') {
      return this.ordersService.findAllOrders();
    }

    return this.ordersService.findOrdersByUser(userId);
  }

  @Get('all')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Listar todos los pedidos (Solo ADMIN)',
    description: 'Obtiene todos los pedidos del sistema. Requiere rol de ADMIN',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de todos los pedidos obtenida exitosamente',
    type: [OrderResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticación requerido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acceso denegado. Se requiere rol de ADMIN',
  })
  async findAllOrders(): Promise<OrderResponseDto[]> {
    return this.ordersService.findAllOrders();
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Actualizar estado del pedido (Solo ADMIN)',
    description: `
    Cambia el estado de un pedido específico. 
    Solo los administradores pueden aprobar o poner pedidos en proceso.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'ID del pedido',
    example: 'order-uuid-123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado del pedido actualizado exitosamente',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Transición de estado inválida o datos incorrectos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pedido no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticación requerido',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: `
    Acceso denegado. 
    Se requiere rol de ADMIN para aprobar pedidos
    `,
  })
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Request() req: AuthenticatedRequest,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const userId = req.user.id;
    return this.ordersService.updateOrderStatus(
      orderId,
      userId,
      updateOrderStatusDto,
    );
  }
}
