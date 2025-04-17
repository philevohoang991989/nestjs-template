import { BaseEntity } from 'src/shared/entity/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'user_role',
})
export class UserRoles extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'screen',
  })
  screen: string;

  @Column({
    name: 'manipulation',
  })
  manipulation: string;

  @Column({
    name: 'role',
  })
  role: string;

  @Column({
    name: 'role_id',
  })
  roleId: number;

  @Column({
    name: 'is_active',
    default: false,
  })
  isActive: boolean;
}
