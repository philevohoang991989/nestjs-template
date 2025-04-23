import { ApiProperty } from '@nestjs/swagger';

export class ActiveUserDTO {
  @ApiProperty()
  isActive?: boolean;
}
