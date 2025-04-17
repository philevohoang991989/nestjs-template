import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDTO {
  @ApiProperty()
  username?: string;

  @ApiPropertyOptional()
  password?: string;

  @ApiPropertyOptional()
  resetToken?: string;

  @ApiPropertyOptional()
  retryNumber?: number;

  @ApiPropertyOptional()
  blockAt?: Date;
}
