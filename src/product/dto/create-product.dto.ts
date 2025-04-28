import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Tên sản phẩm',
    example: 'T-Shirt',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'ID của danh mục sản phẩm',
    example: 1,
  })
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    description: 'ID của loại sản phẩm',
    example: 1,
  })
  @IsNumber()
  productTypeId: number;

  @ApiProperty({
    description: 'Các biến thể sản phẩm (với các tùy chọn)',
    example: [
      {
        name: 'Màu sắc',
        options: [
          { name: 'Red', value: 'Red' },
          { name: 'Green', value: 'Green' },
        ],
      },
      {
        name: 'Kích cỡ',
        options: [
          { name: 'S', value: 'S' },
          { name: 'M', value: 'M' },
        ],
      },
    ],
  })
  variants: {
    name: string;
    options: { name: string; value: string }[];
  }[];
}
