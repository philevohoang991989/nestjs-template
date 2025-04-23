import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FilterUserDTO {
  @ApiProperty()
  keyword?: string;

  @ApiPropertyOptional()
  username: string;

  @ApiPropertyOptional()
  role: number;
}
