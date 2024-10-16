import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Inject,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/shared/guard/roles.guard';
import { CreateUserDTO } from './dto/create-user.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { JwtAuthGuard } from 'src/shared/guard/jwt.guard';
import { ActiveUserDTO } from './dto/active-user.dto';
import { User } from './entities/user.entity';
import { ResponseDTO } from 'src/shared/dto/base.dto';

@Controller('user')
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  async create(@Body() dto: CreateUserDTO) {
    try {
      return await this.userService.create(dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  @Put('active/:id')
  @ApiParam({ name: 'id' })
  async activeUser(@Param('id') id: number, @Body() dto: ActiveUserDTO) {
    return this.userService.activeUser(id, dto);
  }
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  async findById(@Param('id') id: number): Promise<ResponseDTO> {
    return this.userService.findById(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
