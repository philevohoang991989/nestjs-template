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

class AttributeInput {
  @IsNumber()
  attributeId: number;

  @IsString()
  value: string;
}

class AttributeDto {
  @ApiProperty({ description: 'Tên thuộc tính', example: 'Color' })
  @IsNotEmpty()
  @IsString()
  name: string;
}

class ProductAttributeDto {
  @ApiPropertyOptional({
    description: 'ID của thuộc tính đã tồn tại',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  attributeId?: number;

  @ApiPropertyOptional({
    description: 'Thông tin thuộc tính mới (nếu chưa có attributeId)',
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

export class CreateProductDto {
  @ApiProperty({ description: 'Tên sản phẩm', example: 'iPhone 16' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Mô tả sản phẩm', example: 'iHone' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID danh mục', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: 'ID loại sản phẩm', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  productTypeId: number;

  @ApiProperty({
    type: [ProductAttributeDto],
    description: 'Danh sách thuộc tính sản phẩm',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes: ProductAttributeDto[];
}
