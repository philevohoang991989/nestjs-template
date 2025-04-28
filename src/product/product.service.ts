import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Option } from './entities/option.entity';
import { ProductType } from './entities/product-type.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(ProductType)
    private readonly productTypeRepository: Repository<ProductType>,

    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,

    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
  ) { }
  // Tạo mới sản phẩm cùng với các biến thể và tùy chọn
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { name, categoryId, productTypeId, variants } = createProductDto;

    // Tìm kiếm danh mục và loại sản phẩm theo ID
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    const productType = await this.productTypeRepository.findOne({
      where: { id: productTypeId },
    });

    if (!category || !productType) {
      throw new Error('Category or ProductType not found');
    }

    // Tạo mới sản phẩm
    const product = this.productRepository.create({
      name,
      category,
      productType,
    });

    // Lưu sản phẩm vào cơ sở dữ liệu
    const savedProduct = await this.productRepository.save(product);

    // Tạo các biến thể cho sản phẩm
    for (const variantDto of variants) {
      const { name: variantName, options } = variantDto;

      // Tạo mới biến thể sản phẩm
      const productVariant = this.productVariantRepository.create({
        name: variantName,
        product: savedProduct,
      });

      const savedProductVariant =
        await this.productVariantRepository.save(productVariant);

      // Tạo các tùy chọn cho biến thể
      for (const optionDto of options) {
        const { name, value } = optionDto;

        // Tạo mới tùy chọn cho biến thể
        const option = this.optionRepository.create({
          name,
          value,
          productVariant: savedProductVariant,
        });

        await this.optionRepository.save(option);
      }
    }

    return savedProduct;
  }

  findAll() {
    return `This action returns all product`;
  }

  async findOne(@Param('id') id: number) {
    // const product = await this.productRepository.findOne({
    //   where: { id },
    //   relations: [
    //     'productType',
    //     'variants',
    //     'variants.options',
    //     'variants.options.option',
    //   ],
    // });
    // const variants = await this.variantRepository.find({
    //   where: { productType: product.productType },
    //   relations: ['options'],
    // });
    // const productVariants = await this.productVariantRepository.find({
    //   where: { product: { id } },
    //   relations: ['options', 'options.option'],
    // });
    // return {
    //   product,
    //   variants,
    //   productVariants,
    // };
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
