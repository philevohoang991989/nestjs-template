import { ApiPropertyOptional } from '@nestjs/swagger';
import { FindQueryDto } from 'src/shared/dto/find-query.dto';

export class UserFindQueryDto extends FindQueryDto {
  @ApiPropertyOptional()
  email?: string;
}
