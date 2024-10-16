import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
// import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ROLE } from './constants';
import { CreateUserDTO } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { ActiveUserDTO } from './dto/active-user.dto';
import { ERROR_CODE } from 'src/shared/constants/common.constant';
import { ResponseDTO } from 'src/shared/dto/base.dto';
import { ChangePasswordDTO } from 'src/auth/dto/change-password.dto';
import moment from 'moment';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}
  async hashPassword(plainPassword: string) {
    return await bcrypt.hash(plainPassword, 10);
  }
  async create(createUserDto: CreateUserDTO): Promise<User> {
    const toCreateUser = { ...createUserDto, roleId: ROLE.USER };
    toCreateUser.password = await this.hashPassword(toCreateUser.password);

    const user = await this.userRepository.save(toCreateUser);

    const loginUrl = `${this.configService.get('APP_URL')}/login`;

    this.mailService.sendWelcomeEmail(
      loginUrl,
      user.email,
      createUserDto.password,
    );

    return user;
  }

  async findByEmail(username: string): Promise<User> {
    return this.userRepository.findOne({
      where: {
        email: username,
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

  update(
    id: number,
    // updateUserDto: UpdateUserDto
  ) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  async changePassword(
    changePassword: ChangePasswordDTO,
  ): Promise<ResponseDTO> {
    const isExistedUser = await this.userRepository.findOne({
      where: {
        email: changePassword.username.toLocaleLowerCase(),
      },
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
}
