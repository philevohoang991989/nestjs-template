import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
// import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ROLE } from './constants';
import { CreateUserDTO } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}
  async hashPassword(plainPassword: string) {
    return await bcrypt.hash(plainPassword, 10);
  }
  async create(createUserDto: CreateUserDTO): Promise<User> {
    const toCreateUser = { ...createUserDto, roleId: ROLE.USER };
    toCreateUser.password = await this.hashPassword(toCreateUser.password);

    const user = await this.userRepository.save(toCreateUser);

    // const loginUrl = `${this.configService.get('APP_URL')}/login`;

    // this.mailService.sendWelcomeEmail(
    //   loginUrl,
    //   user.email,
    //   createUserDto.password,
    // );

    return user;
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
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
}
