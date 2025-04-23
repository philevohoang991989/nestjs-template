import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { PAGINATION_DEFAULT } from '../constants';
import { FindQueryDto } from '../dto/find-query.dto';

@Injectable()
export class NormalizeFindQueryPipe implements PipeTransform {
  transform(query: FindQueryDto, metadata: ArgumentMetadata) {
    const MAX_LIMIT_VALUE = 1000000;

    // Check and validate the 'limit' as a number
    if (query.limit !== undefined) {
      const parsedLimit = +query.limit; // Convert to number
      if (
        isNaN(parsedLimit) ||
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 0 ||
        parsedLimit > MAX_LIMIT_VALUE
      ) {
        throw new BadRequestException(
          'Invalid limit. Limit must be a positive number.',
        );
      }
      query.limit = parsedLimit;
    } else {
      query.limit = PAGINATION_DEFAULT.LIMIT;
    }

    // Check and validate the 'page' as a number
    if (query.page !== undefined) {
      const parsedPage = +query.page; // Convert to number
      if (
        isNaN(parsedPage) ||
        !Number.isInteger(parsedPage) ||
        parsedPage < 0 ||
        parsedPage > MAX_LIMIT_VALUE
      ) {
        throw new BadRequestException(
          'Invalid page. Page must be a positive number.',
        );
      }
      query.page = parsedPage;
    } else {
      query.page = PAGINATION_DEFAULT.PAGE;
    }

    // Check and validate the 'status' as a number
    if (query.status !== undefined) {
      const parsedStatus = +query.status; // Convert to number
      if (
        isNaN(parsedStatus) ||
        !Number.isInteger(parsedStatus) ||
        parsedStatus < 0 ||
        parsedStatus > MAX_LIMIT_VALUE
      ) {
        throw new BadRequestException(
          'Invalid status. Status must be a positive number.',
        );
      }
      query.status = parsedStatus;
    }

    return query;
  }
}
