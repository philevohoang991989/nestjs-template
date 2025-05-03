import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductType } from './product-type.entity';

@Entity({ name: 'product_attributes' })
export class ProductAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Ví dụ: RAM, Kích cỡ, Màu sắc

  @ManyToOne(() => ProductType, (type) => type.attributes, {
    onDelete: 'CASCADE',
  })
  productType: ProductType;
}
