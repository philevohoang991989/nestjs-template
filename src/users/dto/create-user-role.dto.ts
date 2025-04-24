import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserRoleDTO {
  @ApiProperty({ description: 'Tên màn hình', example: 'UserManagement' })
  @IsString()
  @IsNotEmpty()
  screen: string;

  @ApiProperty({ description: 'Thao tác', example: 'Create' })
  @IsString()
  @IsNotEmpty()
  manipulation: string;

  @ApiProperty({ description: 'Tên role', example: 'Admin' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ description: 'Trạng thái active', example: true })
  @IsBoolean()
  isActive: boolean;
}
