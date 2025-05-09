import { Order } from 'src/order/entities/order.entity';
import { BaseEntity } from 'src/shared/entity/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity({
  name: 'users',
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'username',
  })
  username: string;

  @Column({
    name: 'email',
  })
  email: string;

  @Column({
    name: 'password',
  })
  password: string;

  @Column({
    name: 'name',
  })
  name: string;

  @Column({ name: 'role', nullable: true })
  roleId: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role' })
  role: Role;

  @Column({
    name: 'reset_token',
    nullable: true,
  })
  resetToken: string;

  @Column({
    name: 'is_active',
    default: true,
  })
  isActive: boolean;

  @Column({
    name: 'is_first_login',
    default: false,
  })
  isFirstLogin: boolean;

  @Column({
    name: 'expired_in',
    type: 'timestamptz',
    nullable: true,
  })
  expiredIn: Date;

  @Column({
    name: 'retry_number',
    nullable: true,
  })
  retryNumber: number;

  // Unlock after 30 mins from last try
  @Column({
    name: 'block_at',
    type: 'timestamptz',
    nullable: true,
  })
  blockAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
