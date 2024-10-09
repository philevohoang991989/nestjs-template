import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindQueryDto {
  @ApiPropertyOptional({
    default: 0, // TODO: use constant
  })
  limit?: number;

  @ApiPropertyOptional({
    default: 1,
  })
  page?: number;
}
