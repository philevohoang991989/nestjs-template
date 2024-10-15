import { ApiProperty } from '@nestjs/swagger';

export class LoginDTO {
  @ApiProperty()
  readonly username: string;

  @ApiProperty()
  readonly password: string;
}
