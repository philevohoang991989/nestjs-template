import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MailService } from 'src/mail/mail.service';
import { ERROR_CODE } from 'src/shared/constants/common.constant';
import { ResponseDTO } from 'src/shared/dto/base.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { pattern } from './constants';
import { ActiveAccountDTO } from './dto/active-account';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
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

  async changePasswordFirstLogin(dto: ActiveAccountDTO): Promise<ResponseDTO> {
    // Decode token
    const decodeToken = this.jwtService.decode(dto.resetToken);
    const username = decodeToken['username'];
    const user = await this.userService.findByEmail(username);
    // User not found
    if (!user) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.NOT_FOUND,
          message: 'User not found',
        },
      };
    }

    // Check reset token is valid
    if (user.resetToken !== dto.resetToken) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.TOKEN_INVALID,
          message: 'Reset token is invalid',
        },
      };
    }

    // Check reset token is not expired
    if (decodeToken['exp'] * 1000 <= new Date().getTime()) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.TOKEN_EXPIRED,
          message: 'Token expired',
        },
      };
    }

    // Check password is valid
    if (user.password !== dto.oldPassword) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.OLD_PASSWORD_NOT_MATCH,
          message: 'Password not match',
        },
      };
    }

    // Hash password
    user.password = await this.userService.hashPassword(dto.newPassword);
    user.isFirstLogin = false;
    user.blockAt = null;
    user.resetToken = null;
    user.isActive = true;
    user.expiredIn = moment().add(60, 'day').toDate();

    const updateUser = await this.userRepository.save(user);
    delete updateUser.password;
    return {
      data: updateUser,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Reset password success',
      },
    };
  }

  async requestResetPassword(
    username: string,
    language: string,
  ): Promise<ResponseDTO> {
    const user = await this.validateUsername(username);
    if (!user) {
      return {
        data: undefined,
        msgSts: {
          message: 'User not found',
          code: ERROR_CODE.USER_NOT_FOUND,
        },
      };
    }

    // Generate token: email
    const payload = {
      username: user.username,
      userId: user.id,
    };
    // Send email with reset_token
    const reset_token = this.jwtService.sign(payload, {
      expiresIn: '48h',
    });
    const link = `${this.configService.get('DOMAIN_URL')}/reset-password?token=${reset_token}`;
    const rs = await this.mailService.sendResetPassEmail(
      link,
      username,
      language,
      user.name,
    );
    if (rs) {
      // Save reset token
      await this.userService.update(user.id, { resetToken: reset_token });
      return {
        data: undefined,
        msgSts: {
          message: 'Request reset password success',
          code: ERROR_CODE.SUCCESS,
        },
      };
    } else {
      return {
        data: undefined,
        msgSts: {
          message: 'Request reset password failed: Email does not work',
          code: ERROR_CODE.EMAIL_DOES_NOT_WORK,
        },
      };
    }
  }

  async resetPassword(data: ResetPasswordDTO): Promise<ResponseDTO> {
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

    if (!data.resetToken) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.TOKEN_NOT_FOUND,
          message: 'Token not found',
        },
      };
    }

    const decodeToken = this.jwtService.decode(data.resetToken);
    const username = decodeToken['username'];
    // const dataSaveAudit = new ChangePasswordDTO();
    // dataSaveAudit.username = username;
    // dataSaveAudit.newPassword = data.newPassword;
    // await this.saveAudit(dataSaveAudit);

    const user = await this.userService.findByEmail(username);
    // User not found
    if (!user) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.NOT_FOUND,
          message: 'User not found',
        },
      };
    }

    // Token invalid
    if (user.resetToken !== data.resetToken) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.TOKEN_INVALID,
          message: 'Token invalid',
        },
      };
    }

    //Token expired
    if (decodeToken['exp'] * 1000 <= new Date().getTime()) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.TOKEN_EXPIRED,
          message: 'Token expired',
        },
      };
    }

    data.username = username;
    return await this.userService.resetPassword(data);
  }

  private async validateUsername(username: string): Promise<User> {
    const user = await this.userService.findByEmail(username);
    if (user) {
      delete user.password;
      return user;
    }
    return null;
  }
}
