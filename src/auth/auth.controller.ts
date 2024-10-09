import {
  Body,
  Controller,
  Inject,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDTO } from './dto/login.dto';
import { JwtAuthGuard } from './guard/jwt.guard';
import { LocalAuthGuard } from './guard/local.guard';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: LoginDTO })
  async login(@Request() req): Promise<any> {
    this.logger.log('asdas', req);
    return this.authService.login(req);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('change_password')
  @ApiResponse({
    status: 201,
    description: 'Password has successfully changed',
  })
  @ApiResponse({ status: 400, description: 'Confirm password does not match' })
  @ApiResponse({
    status: 404,
    description: 'User not found or wrong old password',
  })
  async changePassword(
    @Request() req,
    @Body() dto: ChangePasswordDto,
  ): Promise<any> {
    return this.authService.changePassword(req.user, dto);
  }
}
