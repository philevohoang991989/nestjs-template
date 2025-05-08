import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { ProductAttributeValue } from './entities/product-attribute-value.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductType } from './entities/product-type.entity';
import { Product } from './entities/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      Product,
      ProductAttribute,
      ProductType,
      ProductAttributeValue,
      ProductImage,
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule { }
