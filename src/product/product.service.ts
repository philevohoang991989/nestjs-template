import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductAttributeValue } from './entities/product-attribute-value.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductType } from './entities/product-type.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    @InjectRepository(ProductAttribute)
    private readonly attrRepo: Repository<ProductAttribute>,

    @InjectRepository(ProductType)
    private readonly typeRepo: Repository<ProductType>,

    @InjectRepository(ProductAttributeValue)
    private readonly valueRepo: Repository<ProductAttributeValue>,
  ) { }
  async create(dto: CreateProductDto): Promise<any> {
    // 1. Kiểm tra category & productType
    const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
    if (!category) throw new BadRequestException('Category not found');

    const productType = await this.typeRepo.findOneBy({
      id: dto.productTypeId,
    });
    if (!productType) throw new BadRequestException('Product type not found');

    // 2. Tạo sản phẩm mới
    const product = this.productRepo.create({
      name: dto.name,
      description: dto.description,
      category,
      productType,
    });
    const savedProduct = await this.productRepo.save(product);

    // 3. Xử lý attributes
    const valuesToSave = [];

    for (const attrInput of dto.attributes) {
      let attribute;

      // CASE 1: Có attributeId → kiểm tra có tồn tại trong productType không
      if (attrInput.attributeId) {
        attribute = await this.attrRepo.findOne({
          where: {
            id: attrInput.attributeId,
            productType: { id: dto.productTypeId },
          },
        });

        if (!attribute) {
          throw new BadRequestException(
            `Attribute ID ${attrInput.attributeId} is invalid for this product type`,
          );
        }
      }

      // CASE 2: Có attribute.name → tạo mới nếu chưa có
      else if (attrInput.attribute?.name) {
        attribute = await this.attrRepo.findOne({
          where: {
            name: attrInput.attribute.name,
            productType: { id: dto.productTypeId },
          },
        });

        if (!attribute) {
          attribute = this.attrRepo.create({
            name: attrInput.attribute.name,
            productType,
          });
          attribute = await this.attrRepo.save(attribute);
        }
      }

      // CASE 3: Không có attributeId và không có attribute.name
      else {
        throw new BadRequestException(
          'Missing attributeId or attribute.name in one of the attributes',
        );
      }

      // Tạo product attribute value
      const attrValue = this.valueRepo.create({
        product: savedProduct,
        attribute,
        value: attrInput.value,
      });

      valuesToSave.push(attrValue);
    }

    // 4. Lưu tất cả values
    await this.valueRepo.save(valuesToSave);

    // 5. Trả kết quả
    return {
      data: savedProduct,
      msgSts: {
        code: 0,
        message: 'Create product success',
      },
    };
  }

  async findAll(): Promise<Product[]> {
    return this.productRepo.find({ relations: ['category'] });
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
