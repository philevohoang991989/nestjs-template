import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/categorys/entities/category.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Product)
    private readonly cateroryRepository: Repository<Category>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) { }
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const category = await this.cateroryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Category ID ${createProductDto.categoryId} không tồn tại`,
      );
    }
    const product = this.productRepository.create({
      name: createProductDto.name,
      category,
      variants: createProductDto.variants,
    });
    await this.productRepository.save(product);

    if (createProductDto.variants) {
      const variants = createProductDto.variants.map((variantDto) => {
        const variant = this.productVariantRepository.create({
          ...variantDto,
          product: product, // liên kết với sản phẩm
        });
        return variant;
      });

      // Đảm bảo là mảng một chiều các đối tượng ProductVariant
      await this.productVariantRepository.save(variants);
    }

    return product;
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
