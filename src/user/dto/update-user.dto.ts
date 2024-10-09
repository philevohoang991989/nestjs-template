import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  password?: string;
}
