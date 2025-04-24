import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDTO {
  @ApiProperty({ description: 'Tên người dùng', example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Tên đăng nhập', example: 'nguyenvana' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Email người dùng', example: 'a@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mật khẩu mạnh',
    example: 'StrongP@ss123',
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @ApiProperty({ description: 'ID của role', example: 1 })
  @IsNumber()
  role: number;
}
