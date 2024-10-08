import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ROLE } from '../constants';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'email',
    length: 255,
    nullable: false,
  })
  @Index({ unique: true })
  email: string;

  @Exclude()
  @Column({
    name: 'password',
    nullable: false,
  })
  password: string;

  @Column({
    name: 'name',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'role_id',
    nullable: false,
    default: ROLE.USER,
  })
  roleId: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({
    name: 'deleted_at',
  })
  deletedAt: Date;
}
