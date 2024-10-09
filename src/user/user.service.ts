import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Pagination } from 'src/shared/dto/pagination.dto';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFindQueryDto } from './dto/user-find-query.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User> {
    return await this.userRepository.findOneOrFail({
      where: {
        id: id,
      },
    });
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
  }

  async compareHashedPassword(plain: string, hashed: string) {
    return await bcrypt.compare(plain, hashed);
  }

  async hashPassword(plainPassword: string) {
    return await bcrypt.hash(plainPassword, 10);
  }

  async updatePassword(user: User, newPassword: string) {
    user.password = await this.hashPassword(newPassword);

    return this.userRepository.save(user);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.password = await this.hashPassword(createUserDto.password);

    return this.userRepository.save(createUserDto);
  }

  async paginate(filter: UserFindQueryDto): Promise<Pagination<User>> {
    const qb = this.userRepository.createQueryBuilder('user');

    if (filter.email) {
      qb.andWhere('user.email = :email', { email: filter.email });
    }

    const results = await qb
      .offset(+filter.limit * (+filter.page - 1))
      .limit(+filter.limit)
      .getManyAndCount();

    return new Pagination(results);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneByOrFail({ id });

    if (dto?.email) {
      user.email = dto.email;
    }

    if (dto?.name) {
      user.name = dto.name;
    }

    if (dto?.password) {
      user.password = dto.password;
    }

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<User> {
    const user = await this.userRepository.findOneOrFail({
      where: {
        id: id,
      },
    });
    this.userRepository.softRemove(user);

    return user;
  }
}
