import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindOneQueryDto {
  @ApiPropertyOptional()
  relations: string;

  @ApiPropertyOptional()
  fields: string;
}
