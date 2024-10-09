import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty()
  readonly oldPassword: string;

  @ApiProperty()
  readonly newPassword: string;

  @ApiProperty()
  readonly confirmNewPassword: string;
}
