import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product } from 'src/product/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { LowStockQueryDto } from './dto/low-stock-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './order.service';

@Controller('orders')
@ApiTags('Orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post(':userId')
  async createOrder(
    @Param('userId') userId: number,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(userId, dto);
  }

  @Patch(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(orderId, dto);
  }

  @Get('user/:userId')
  async getOrdersByUser(@Param('userId') userId: number) {
    return this.ordersService.getOrdersByUser(userId);
  }

  @ApiOperation({ summary: 'Lấy danh sách sản phẩm có tồn kho thấp' })
  @ApiQuery({
    name: 'threshold',
    required: false,
    type: Number,
    description: 'Ngưỡng tồn kho. Mặc định là 5',
    example: 3,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm có tồn kho thấp',
    type: [Product],
  })
  @Get('products/low-stock')
  async getLowStock(@Query() query: LowStockQueryDto): Promise<Product[]> {
    return this.ordersService.getLowStockProducts(query.threshold);
  }
}
