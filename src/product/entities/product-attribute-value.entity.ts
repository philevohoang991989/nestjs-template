import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductAttribute } from './product-attribute.entity';
import { Product } from './product.entity';

@Entity({ name: 'product_attribute_values' })
export class ProductAttributeValue {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.attributes, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @ManyToOne(() => ProductAttribute, { eager: true, onDelete: 'CASCADE' })
  attribute: ProductAttribute;

  @Column()
  value: string;
}
