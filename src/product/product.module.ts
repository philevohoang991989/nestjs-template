import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Option } from './entities/option.entity';
import { ProductType } from './entities/product-type.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      ProductType,
      ProductVariant,
      Option,
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule { }
