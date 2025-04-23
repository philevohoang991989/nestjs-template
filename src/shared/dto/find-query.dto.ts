import { ApiPropertyOptional } from '@nestjs/swagger';
import { PAGINATION_DEFAULT } from '../constants';

export class FindQueryDto {
  @ApiPropertyOptional({
    default: PAGINATION_DEFAULT.LIMIT,
  })
  limit?: number;

  @ApiPropertyOptional({
    default: PAGINATION_DEFAULT.PAGE,
  })
  page?: number;

  @ApiPropertyOptional()
  to?: Date;

  @ApiPropertyOptional()
  from?: Date;

  @ApiPropertyOptional()
  relations?: string;

  @ApiPropertyOptional()
  fields?: string;

  @ApiPropertyOptional()
  sort?: string;

  @ApiPropertyOptional()
  keyword?: string;

  @ApiPropertyOptional()
  status?: number;
}
