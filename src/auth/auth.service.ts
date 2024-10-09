import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthPayload } from './interface/auth-payload.interface';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject()
    private userService: UserService,
    @Inject()
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, plainPassword: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (
      user &&
      (await this.userService.compareHashedPassword(
        plainPassword,
        user.password,
      ))
    ) {
      delete user.password;

      return user;
    }

    return null;
  }

  async login(user: User) {
    const payload: AuthPayload = {
      password: user.password,
      email: user.email,
      id: user.id,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async changePassword(user, dto: ChangePasswordDto): Promise<any> {
    if (dto.confirmNewPassword != dto.newPassword) {
      throw new BadRequestException('Confirm password does not match');
    }

    const validatedUser = await this.validateUser(user.email, dto.oldPassword);

    if (!validatedUser) {
      throw new NotFoundException('User not found or wrong old password');
    }

    return this.userService.updatePassword(validatedUser, dto.newPassword);
  }
}
