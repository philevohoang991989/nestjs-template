import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseDTO } from 'src/shared/dto/base.dto';
import { AuthService } from './auth.service';
import { ActiveAccountDTO } from './dto/active-account';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { LoginDTO } from './dto/login.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginDTO })
  async login(@Body() data: LoginDTO): Promise<ResponseDTO> {
    return this.authService.login(data);
  }

  @Post('request-reset-password/:email/:language')
  @ApiParam({ name: 'email' })
  async requestResetPassword(
    @Param('email') email: string,
  ): Promise<ResponseDTO> {
    return this.authService.requestResetPassword(email, 'VN');
  }

  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDTO): Promise<ResponseDTO> {
    return this.authService.resetPassword(data);
  }

  @Post('change-password')
  async changePassword(@Body() data: ChangePasswordDTO): Promise<ResponseDTO> {
    return this.authService.changePassword(data);
  }

  @Post('active-account')
  async activeAccount(@Body() dto: ActiveAccountDTO): Promise<ResponseDTO> {
    return this.authService.changePasswordFirstLogin(dto);
  }
}
