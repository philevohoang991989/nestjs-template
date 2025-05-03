import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({ description: 'Tên danh mục', example: 'Điện thoại' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'ID của danh mục cha', example: 1 })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}
