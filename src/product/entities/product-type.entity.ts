import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductAttribute } from './product-attribute.entity';

@Entity({ name: 'product_types' })
export class ProductType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => ProductAttribute, (attr) => attr.productType)
  attributes: ProductAttribute[];
}
