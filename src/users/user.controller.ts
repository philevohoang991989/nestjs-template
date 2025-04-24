import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ResponseDTO } from 'src/shared/dto/base.dto';
import { FindQueryDto } from 'src/shared/dto/find-query.dto';
import { NormalizeFindQueryPipe } from 'src/shared/pipes/normalize-find-query.pipe';
import { Logger } from 'winston';
import { ActiveUserDTO } from './dto/active-user.dto';
import { CreateRoleArrayDTO } from './dto/create-role-array.dto';
import { CreateUserRoleDTO } from './dto/create-user-role.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { FilterUserDTO } from './dto/user-filter.dto';
import { NormalizeFilterPipe } from './pipes/normalize-filter.pipe';
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

  @Post('pagination')
  async pagination(
    @Body(NormalizeFilterPipe) filters: FilterUserDTO,
    @Query(NormalizeFindQueryPipe) query: FindQueryDto,
  ) {
    return this.userService.pagination(filters, query);
  }

  @Post('register')
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

  @Post('pagination-role')
  async paginationRole(@Query(NormalizeFindQueryPipe) query: FindQueryDto) {
    return this.userService.paginationRole(query);
  }

  @Post('group/:id')
  @ApiParam({ name: 'id' })
  async getRoleGroup(@Param('id') id: number) {
    return this.userService.paginationRoleGroup(id);
  }

  @Get('list-role')
  async listAllRoles(): Promise<ResponseDTO> {
    return this.userService.listRole();
  }

  @Post('create-role')
  @ApiOperation({ summary: 'Tạo danh sách role thao tác cho hệ thống' })
  @ApiResponse({
    status: 200,
    description: 'Tạo thành công các quyền',
  })
  async createRole(@Body() dtos: CreateRoleArrayDTO): Promise<ResponseDTO> {
    return this.userService.createRole(dtos.roles);
  }

  @Get('pagination-role-user/:id')
  @ApiParam({ name: 'id' })
  async paginationRoleUser(@Param('id') id: number): Promise<ResponseDTO> {
    return this.userService.paginationRoleUser(id);
  }

  @Post('create-role-single/:id')
  @ApiParam({ name: 'id' })
  async createRoleSingle(
    @Param('id') id: number,
    @Body() dto: CreateUserRoleDTO[],
  ): Promise<ResponseDTO> {
    return this.userService.createRoleSingle(id, dto);
  }
}
