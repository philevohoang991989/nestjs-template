import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateUserRoleDTO } from './create-user-role.dto';

export class CreateRoleArrayDTO {
  @ApiProperty({
    description: 'Danh sách role cần tạo',
    type: [CreateUserRoleDTO],
    example: [
      {
        screen: 'Dashboard',
        manipulation: 'View',
        role: 'Admin',
        isActive: true,
      },
      {
        screen: 'UserManagement',
        manipulation: 'Create',
        role: 'Admin',
        isActive: true,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserRoleDTO)
  roles: CreateUserRoleDTO[];
}
