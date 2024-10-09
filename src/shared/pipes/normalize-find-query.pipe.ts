import { Injectable, PipeTransform } from '@nestjs/common';
import { FindQueryDto } from '../dto/find-query.dto';

@Injectable()
export class NormalizeFindQueryPipe implements PipeTransform {
  transform(query: FindQueryDto) {
    if (query.limit == undefined) {
      query.limit = 0;
    }

    if (query.page == undefined) {
      query.page = 1;
    }

    return query;
  }
}
