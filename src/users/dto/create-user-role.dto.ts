import { ApiProperty } from '@nestjs/swagger';

export class CreateUserRoleDTO {
  @ApiProperty()
  screen: string;

  @ApiProperty()
  manipulation: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  isActive: boolean;
}
