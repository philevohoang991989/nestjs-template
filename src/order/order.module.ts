import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, User, OrderItem])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrderModule { }
