import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/categorys/entities/category.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductVariant, Category])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule { }
