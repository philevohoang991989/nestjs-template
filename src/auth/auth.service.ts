import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ResponseDTO } from 'src/shared/dto/base.dto';
import { ERROR_CODE } from 'src/shared/constants/common.constant';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { pattern } from './constants';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login({ username, password }): Promise<ResponseDTO> {
    this.logger.log('Starting process Login', 'PROFILING', username, password);
    this.logger.debug(
      `Username: ${username}, Password: ${password}`,
      'PROFILING',
    );

    const user = await this.userService.findByEmail(username.trim());
    const payload = {
      username: user.username,
      email: user.email,
      roleId: user.roleId,
    };
    this.logger.debug(user, 'PROFILING');
    this.logger.log('End process Login', 'PROFILING');
    // const { ...rest } = user;
    return new ResponseDTO({
      data: {
        access_token: await this.jwtService.signAsync(payload),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.roleId,
      },
      msgSts: {
        message: 'Login success',
        code: ERROR_CODE.SUCCESS,
      },
    });
  }
  create(createAuthDto: CreateAuthDto) {
    this.logger.log('Starting process Create', createAuthDto);
    return 'This action adds a new auth';
  }
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
  async changePassword(data: ChangePasswordDTO): Promise<ResponseDTO> {
    if (!pattern.test(data.newPassword)) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.NOT_FOUND,
          message:
            'Password length must be at least 8 characters, letters, numbers and special characters.',
        },
      };
    }
    return await this.userService.changePassword(data);
  }
  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
