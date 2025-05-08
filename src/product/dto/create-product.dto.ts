import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// Dùng khi client muốn tạo attribute mới
class AttributeDto {
  @ApiProperty({ description: 'Tên thuộc tính', example: 'Size' })
  @IsNotEmpty()
  @IsString()
  name: string;
}

// Đại diện cho mỗi thuộc tính sản phẩm
class ProductAttributeDto {
  @ApiPropertyOptional({
    description: 'ID thuộc tính nếu đã tồn tại',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  attributeId?: number;

  @ApiPropertyOptional({
    description: 'Thông tin thuộc tính mới nếu attributeId không có',
    type: AttributeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AttributeDto)
  attribute?: AttributeDto;

  @ApiProperty({ description: 'Giá trị thuộc tính', example: 'Red' })
  @IsNotEmpty()
  @IsString()
  value: string;
}

// DTO chính cho tạo sản phẩm
export class CreateProductDto {
  @ApiProperty({ description: 'Tên sản phẩm', example: 'iPhone 16' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả sản phẩm', example: 'iHone' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID danh mục sản phẩm', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: 'ID loại sản phẩm', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  productTypeId: number;

  @ApiProperty({
    type: [ProductAttributeDto],
    description: 'Danh sách thuộc tính của sản phẩm',
    example: [
      { attributeId: 1, value: 'Red' },
      { attribute: { name: 'Size' }, value: 'M' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes: ProductAttributeDto[];

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'Upload nhiều hình ảnh cho sản phẩm',
  })
  images?: string[]; // không cần validate vì được set sau từ file
}
