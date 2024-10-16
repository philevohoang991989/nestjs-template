import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDTO {
  @ApiProperty()
  username: string;

  @ApiProperty()
  oldPassword: string;

  @ApiProperty()
  newPassword: string;
}
