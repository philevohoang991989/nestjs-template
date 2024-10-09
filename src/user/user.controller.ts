import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { Pagination } from 'src/shared/dto/pagination.dto';
import { NormalizeFindQueryPipe } from 'src/shared/pipes/normalize-find-query.pipe';
import { Logger } from 'winston';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFindQueryDto } from './dto/user-find-query.dto';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@ApiTags('User')
@Controller('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(
    private userSevice: UserService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get('me')
  async getCurrentUser(@Request() req): Promise<User> {
    return await this.userSevice.findById(req.user?.id);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    try {
      return await this.userSevice.create(dto);
    } catch (e) {
      this.logger.error(e.message, e.stack, UserController.name);
      throw new BadRequestException(e.message);
    }
  }

  @Get()
  async find(
    @Query(NormalizeFindQueryPipe) query: UserFindQueryDto,
  ): Promise<Pagination<User>> {
    try {
      return await this.userSevice.paginate(query);
    } catch (e) {
      this.logger.error(e.message, e.stack, UserController.name);
      throw new BadRequestException(e.message);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    try {
      return await this.userSevice.update(id, dto);
    } catch (e) {
      this.logger.error(e.message, e.stack, UserController.name);
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<User> {
    try {
      return await this.userSevice.remove(id);
    } catch (e) {
      this.logger.error(e.message, e.stack, UserController.name);
      throw new BadRequestException(e.message);
    }
  }
}
