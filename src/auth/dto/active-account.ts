import { ApiProperty } from '@nestjs/swagger';

export class ActiveAccountDTO {
  @ApiProperty()
  resetToken: string;

  @ApiProperty()
  oldPassword: string;

  @ApiProperty()
  newPassword: string;
}
