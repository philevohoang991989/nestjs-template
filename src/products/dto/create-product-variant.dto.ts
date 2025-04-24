import { IsNumber, IsString } from 'class-validator';

export class CreateProductVariantDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;
}
