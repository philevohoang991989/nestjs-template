import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ChangePasswordDTO } from 'src/auth/dto/change-password.dto';
import { ResetPasswordDTO } from 'src/auth/dto/reset-password.dto';
import { MailService } from 'src/mail/mail.service';
import { ERROR_CODE, UserRole } from 'src/shared/constants/common.constant';
import { ResponseDTO } from 'src/shared/dto/base.dto';
import { Repository } from 'typeorm';
import { ActiveUserDTO } from './dto/active-user.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async hashPassword(plainPassword: string) {
    return await bcrypt.hash(plainPassword, 10);
  }
  async create(createUserDto: CreateUserDTO): Promise<ResponseDTO> {
    const isExistedUser = await this.userRepository.findOne({
      where: {
        username: createUserDto.username.toLocaleLowerCase(),
      },
    });
    if (isExistedUser) {
      return {
        data: null,
        msgSts: {
          code: ERROR_CODE.EMAIL_EXISTED,
          message: 'Username is existed',
        },
      };
    }

    // Generate password | token (expires in 48hours) and send email
    const reset_token = this.jwtService.sign({
      username: createUserDto.username,
    });

    const temporaryPassword = 'P@ssword@123';
    const newUser = new User();
    newUser.name = createUserDto.name;
    newUser.username = createUserDto.username;
    newUser.email = createUserDto.email;
    newUser.retryNumber = 0;
    newUser.password = await this.hashPassword(temporaryPassword);
    newUser.resetToken = reset_token;
    newUser.isFirstLogin = false;
    newUser.roleId = createUserDto.role || UserRole.Uploader;
    newUser.isActive = true;
    const user = await this.userRepository.save(newUser);

    const loginUrl = `${this.configService.get('APP_URL')}/active-account?token=${reset_token}`;

    this.mailService.sendWelcomeEmail(
      loginUrl,
      user.email,
      createUserDto.password,
    );

    delete user.password;
    delete user.resetToken;
    return {
      data: {},
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Register success',
      },
    };
  }

  async findByEmail(username: string): Promise<User> {
    const user = this.userRepository.findOne({
      where: {
        username: username,
      },
    });
    this.logger.log(user, 'USER');
    return this.userRepository.findOne({
      where: {
        username: username,
      },
    });
  }
  async compareHashedPassword(plain: string, hashed: string) {
    return await bcrypt.compare(plain, hashed);
  }
  async activeUser(id: number, dto: ActiveUserDTO) {
    const existedUser = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!existedUser) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.USER_NOT_FOUND,
          message: 'Username not found',
        },
      };
    }

    if (!dto.isActive) {
      existedUser.isActive = false;
      await this.userRepository.save(existedUser);
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.SUCCESS,
          message: 'De-active user success',
        },
      };
    } else {
      existedUser.isActive = true;
    }

    existedUser.isFirstLogin = true;
    existedUser.retryNumber = 0;
    existedUser.blockAt = null;
    await this.userRepository.save(existedUser);

    return {
      data: undefined,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Active user success',
      },
    };
  }
  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }
  async findById(id: number): Promise<ResponseDTO> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, createdAt, updatedAt, deletedAt, ...result } = user;
    return {
      data: result,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'get user success',
      },
    };
  }

  async update(id: number, updateUserDto: UpdateUserDTO): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: id } });
    if (updateUserDto.resetToken) {
      user.resetToken = updateUserDto.resetToken;
    }
    if (updateUserDto.retryNumber !== undefined) {
      user.retryNumber = updateUserDto.retryNumber;
    }
    if (updateUserDto.blockAt) {
      user.blockAt = updateUserDto.blockAt;
    }
    if (updateUserDto.password) {
      user.password = await this.hashPassword(updateUserDto.password);
    }

    return this.userRepository.save(user);
  }

  async remove(id: number) {
    this.logger.log(id);
    this.userRepository.softDelete(id);

    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
      withDeleted: true,
    });

    return {
      data: user,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Delete user success',
      },
    };
  }
  async changePassword(
    changePassword: ChangePasswordDTO,
  ): Promise<ResponseDTO> {
    const isExistedUser = await this.userRepository.findOne({
      where: [
        { email: changePassword.username.toLocaleLowerCase() },
        { username: changePassword.username.toLocaleLowerCase() },
      ],
    });
    if (!isExistedUser) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.NOT_FOUND,
          message: 'User not found',
        },
      };
    }

    // Compare password
    if (
      !(await this.compareHashedPassword(
        changePassword.oldPassword,
        isExistedUser.password,
      ))
    ) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.OLD_PASSWORD_NOT_MATCH,
          message: 'Old password not match',
        },
      };
    }

    // New password same as old password
    if (changePassword.oldPassword === changePassword.newPassword) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.OLD_PASSWORD_SAME_NEW_PASSWORD,
          message: 'Old password is same as new password',
        },
      };
    }

    isExistedUser.password = await this.hashPassword(
      changePassword.newPassword,
    );
    isExistedUser.blockAt = null;
    isExistedUser.retryNumber = 0;
    isExistedUser.expiredIn = moment().add(60, 'day').toDate();
    const user = await this.userRepository.save(isExistedUser);
    delete user.password;

    return {
      data: user,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Change password success',
      },
    };
  }
  async resetPassword(resetPassword: ResetPasswordDTO): Promise<ResponseDTO> {
    const isExistedUser = await this.userRepository.findOne({
      where: {
        username: resetPassword.username.toLocaleLowerCase(),
      },
    });
    if (!isExistedUser) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.NOT_FOUND,
          message: 'Username is existed',
        },
      };
    }

    isExistedUser.password = await this.hashPassword(resetPassword.newPassword);
    isExistedUser.resetToken = null;
    isExistedUser.retryNumber = 0;
    isExistedUser.blockAt = null;
    isExistedUser.expiredIn = moment().add(60, 'day').toDate();
    const user = await this.userRepository.save(isExistedUser);
    delete user.password;

    return {
      data: user,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Reset password success',
      },
    };
  }
}
