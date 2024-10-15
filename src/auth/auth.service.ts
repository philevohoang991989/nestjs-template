import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ResponseDTO } from 'src/shared/dto/base.dto';
import { ERROR_CODE } from 'src/shared/constants/common.constant';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async login({ username, password }): Promise<ResponseDTO> {
    this.logger.log('Starting process Login', 'PROFILING', username, password);

    this.logger.log('End process Login', 'PROFILING');
    return new ResponseDTO({
      data: {
        access_token: 'asdasdasdasdasdas',
      },
      msgSts: {
        message: 'Login success',
        code: ERROR_CODE.SUCCESS,
      },
    });
  }
  create(createAuthDto: CreateAuthDto) {
    this.logger.log('Starting process Create', createAuthDto);
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
