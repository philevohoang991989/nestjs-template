import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ResponseDTO } from 'src/shared/dto/base.dto';
import { Logger } from 'winston';
import { ActiveUserDTO } from './dto/active-user.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('Users')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Post()
  // @UseGuards(RolesGuard)
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
