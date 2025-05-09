import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class LowStockQueryDto {
  @ApiPropertyOptional({
    description: 'Ngưỡng tồn kho tối đa',
    example: 5,
    default: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  threshold?: number = 5;
}