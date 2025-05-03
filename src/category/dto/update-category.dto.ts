import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Tên danh mục', example: 'Máy tính bảng' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'ID của danh mục cha', example: 2 })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}