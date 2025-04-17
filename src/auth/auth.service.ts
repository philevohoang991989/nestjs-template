import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ERROR_CODE } from 'src/shared/constants/common.constant';
import { ResponseDTO } from 'src/shared/dto/base.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { pattern } from './constants';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ username, password }): Promise<ResponseDTO> {
    this.logger.log('Starting process Login', 'PROFILING', username, password);
    this.logger.debug(
      `Username: ${username}, Password: ${password}`,
      'PROFILING',
    );
    let retryNumber;
    // Find the user by email (username)
    const user = await this.userService.findByEmail(username.trim());

    if (!user) {
      // Check if the user was deleted
      const userDeleted = await this.userRepository.find({
        where: { username: username.trim() },
        withDeleted: true,
      });

      this.logger.debug(userDeleted, 'PROFILING');

      // If the user exists in the deleted state, return the appropriate message
      if (userDeleted[0]?.deletedAt != null) {
        return {
          data: userDeleted,
          msgSts: {
            message: 'Account Deleted',
            code: ERROR_CODE.ACCOUNT_DELETED,
          },
        };
      } else {
        return {
          data: undefined,
          msgSts: {
            message: 'Username or password does not match',
            code: ERROR_CODE.USERNAME_PASSWORD_NOT_MATCH,
          },
        };
      }
    }
    if (user.blockAt && user.blockAt.valueOf() - Date.now() > 0) {
      return {
        data: undefined,
        msgSts: {
          message: 'Account has been locked for 30 minutes',
          code: ERROR_CODE.BLOCK_ACCOUNT,
        },
      };
    }
    const checkPassword = await this.userService.compareHashedPassword(
      password.trim(),
      user.password,
    );
    if (!checkPassword) {
      retryNumber = user.retryNumber + 1;
      if (retryNumber >= 5) {
        const blockAt = moment().add(30, 'm').toDate();
        this.userService.update(user.id, { blockAt: blockAt });
      } else {
        await this.userService.update(user.id, { retryNumber: retryNumber });
      }
      return {
        data: undefined,
        msgSts: {
          message: 'Username or password does not match',
          code: ERROR_CODE.USERNAME_PASSWORD_NOT_MATCH,
        },
      };
    }
    if (!user.isActive) {
      return {
        data: undefined,
        msgSts: {
          message:
            'Your account has not been activated, please contact the system administrator!',
          code: ERROR_CODE.ACCOUNT_NOT_ACTIVATED,
        },
      };
    }

    // Prepare payload if user exists
    const payload = {
      username: user.username,
      email: user.email,
      roleId: user.roleId,
    };

    this.logger.debug(user, 'PROFILING');
    this.logger.log('End process Login', 'PROFILING');

    return new ResponseDTO({
      data: {
        access_token: await this.jwtService.signAsync(payload),
        name: user.name,
        id: user.id,
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
