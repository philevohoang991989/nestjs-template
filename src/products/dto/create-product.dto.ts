import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateProductVariantDto } from './create-product-variant.dto';
export class CreateProductDto {
  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'T-Shirt',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ID của danh mục sản phẩm',
    example: 1,
  })
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    description: 'Danh sách các variants của sản phẩm',
    type: [CreateProductVariantDto],
    example: [
      {
        name: 'Red',
        price: 100,
      },
      {
        name: 'Blue',
        price: 120,
      },
    ],
    required: false,
  })
  @IsArray()
  @IsOptional()
  variants?: CreateProductVariantDto[];
}
