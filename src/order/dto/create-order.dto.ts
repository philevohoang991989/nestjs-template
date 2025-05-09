import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ example: 1, description: 'ID của sản phẩm' })
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 2, description: 'Số lượng sản phẩm muốn đặt' })
  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: [OrderItemDto],
    description: 'Danh sách sản phẩm trong đơn hàng',
    example: [
      { productId: 1, quantity: 2 },
      { productId: 3, quantity: 1 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
