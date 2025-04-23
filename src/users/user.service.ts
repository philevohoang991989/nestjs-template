import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
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
import { FindQueryDto } from 'src/shared/dto/find-query.dto';
import { Pagination } from 'src/shared/dto/pagination.dto';
import { getOrderByClause } from 'src/shared/helpers/query-sort.helper';
import { Brackets, Repository } from 'typeorm';
import { ActiveUserDTO } from './dto/active-user.dto';
import { CreateUserRoleDTO } from './dto/create-user-role.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { FilterUserDTO } from './dto/user-filter.dto';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { UserRoles } from './entities/userRole.entity';
import { UserRoleSingle } from './entities/userRoleSingle.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserRoles)
    private readonly userRoleRepository: Repository<UserRoles>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectRepository(UserRoleSingle)
    private readonly userRoleSingleRepository: Repository<UserRoleSingle>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async hashPassword(plainPassword: string) {
    return await bcrypt.hash(plainPassword, 10);
  }

  async pagination(
    filters: FilterUserDTO,
    query?: FindQueryDto,
  ): Promise<ResponseDTO> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role');

    if (filters.keyword) {
      qb.andWhere(
        new Brackets((sqb) => {
          sqb
            .where('user.name ILIKE :keyword', {
              keyword: `%${filters.keyword}%`,
            })
            .orWhere('user.username ILIKE :keyword');
        }),
      );
    }

    if (filters.role) {
      qb.andWhere('user.role = :role', { role: filters.role });
    }

    if (query.sort) {
      qb.orderBy(getOrderByClause(query.sort));
    } else {
      qb.orderBy('user.id', 'DESC');
    }

    const results = await qb
      .skip(+query.limit * (+query.page - 1))
      .take(+query.limit)
      .getManyAndCount();
    const payload = new Pagination(results);

    for (const user of payload.items) {
      user['roleUsers'] = await this.findRoleUserSingle(user.id);
    }

    return {
      data: payload,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Get user success',
      },
    };
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

  async findRoleUserSingle(id: number) {
    return await this.userRoleSingleRepository
      .createQueryBuilder('user_role_single')
      .andWhere('user_role_single.userId = :userId', {
        userId: id,
      })
      .getMany();
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

  async paginationRole(query?: FindQueryDto): Promise<ResponseDTO> {
    const qb = this.userRoleRepository.createQueryBuilder('user_role');
    if (query.sort) {
      qb.orderBy(getOrderByClause(query.sort));
    } else {
      qb.orderBy('user_role.id', 'ASC');
    }

    const results = await qb.getMany();

    const roles = results.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.role === value.role),
    );

    const listRole = roles.map((currElement, index) => {
      return {
        id: index,
        name: currElement.role,
      };
    });

    const groupByScreen = results.reduce(function (r, a) {
      r[a.screen] = r[a.screen] || [];
      r[a.screen].push(a);
      return r;
    }, Object.create(null));

    return {
      data: { listRole, groupByScreen },
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Get user success',
      },
    };
  }
  async findRole(filters: CreateUserRoleDTO) {
    return await this.userRoleRepository
      .createQueryBuilder('user_role')
      .andWhere('user_role.screen = :screen', {
        screen: filters.screen,
      })
      .andWhere('user_role.manipulation = :manipulation', {
        manipulation: filters.manipulation,
      })
      .andWhere('user_role.role = :role', {
        role: filters.role,
      })
      .getOne();
  }

  async paginationRoleGroup(id: number): Promise<ResponseDTO> {
    const results = await this.userRoleRepository
      .createQueryBuilder('user_role')
      .andWhere('user_role.roleId = :roleId', {
        roleId: id,
      })
      .orderBy('user_role.id', 'ASC')
      .getMany();

    const roles = results.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.role === value.role),
    );

    const listRole = roles.map((currElement, index) => {
      return {
        id: index,
        name: currElement.role,
      };
    });

    const groupByScreen = results.reduce(function (r, a) {
      r[a.screen] = r[a.screen] || [];
      r[a.screen].push(a);
      return r;
    }, Object.create(null));

    return {
      data: { listRole, groupByScreen },
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Get user success',
      },
    };
  }

  async listRole(): Promise<ResponseDTO> {
    const qb = this.roleRepository
      .createQueryBuilder('role')
      .orderBy('role.id', 'ASC');

    const results = await qb.getMany();

    return {
      data: results,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Get user success',
      },
    };
  }

  async role(filters: CreateUserRoleDTO) {
    this.logger.log(filters?.role, 'ROLE_NAME');
    if (!filters?.role) {
      throw new BadRequestException('Role name is required');
    }

    let role = await this.roleRepository.findOne({
      where: { name: filters.role },
    });

    if (!role) {
      role = this.roleRepository.create({ name: filters.role });

      role = await this.roleRepository.save(role);
    }

    return role;
  }

  async createRole(dto: CreateUserRoleDTO): Promise<ResponseDTO> {
    const userRoles = [];
    this.logger.log(dto, 'ROLE');
    const userRole = new UserRoles();
    const role = await this.role(dto);
    const userRoleData = await this.findRole(dto);

    if (userRoleData?.id) {
      userRole.id = userRoleData.id;
    }

    userRole.roleId = role.id;
    userRole.screen = dto.screen;
    userRole.manipulation = dto.manipulation;
    userRole.role = dto.role;
    userRole.isActive = dto.isActive;

    userRoles.push(userRole);

    const payload = await this.userRoleRepository.save(userRoles);
    return {
      data: payload,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Create location success',
      },
    };
  }
  async paginationRoleUser(id): Promise<ResponseDTO> {
    const results = await this.findRoleUserSingle(id);

    return {
      data: results,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Get user success',
      },
    };
  }
}
