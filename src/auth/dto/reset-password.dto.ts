import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResetPasswordDTO {
  @ApiPropertyOptional()
  username?: string;

  @ApiProperty()
  newPassword: string;

  @ApiPropertyOptional()
  resetToken: string;
}
