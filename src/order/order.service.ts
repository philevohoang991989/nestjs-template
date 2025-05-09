import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async createOrder(userId: number, dto: CreateOrderDto): Promise<Order> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let totalAmount = 0;
    const items: OrderItem[] = [];

    for (const item of dto.items) {
      const product = await this.productRepo.findOne({
        where: { id: item.productId },
      });
      if (!product || product.stock < item.quantity) {
        throw new BadRequestException(
          `Product ${item.productId} is out of stock`,
        );
      }

      product.stock -= item.quantity;
      await this.productRepo.save(product);

      const orderItem = this.orderItemRepo.create({
        product,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;
      items.push(orderItem);
    }

    const order = this.orderRepo.create({
      user,
      items,
      totalAmount,
      status: OrderStatus.PENDING,
    });

    return this.orderRepo.save(order);
  }

  async updateOrderStatus(
    orderId: number,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = dto.status;
    return this.orderRepo.save(order);
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });
  }

  async getLowStockProducts(threshold: number = 5): Promise<Product[]> {
    return this.productRepo.find({
      where: { stock: LessThanOrEqual(threshold) },
    });
  }
}
