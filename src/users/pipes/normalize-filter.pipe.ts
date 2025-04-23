import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { FilterUserDTO } from '../dto/user-filter.dto';

@Injectable()
export class NormalizeFilterPipe implements PipeTransform {
  transform(filter: FilterUserDTO, metadata: ArgumentMetadata) {
    const MAX_LIMIT_VALUE = 1000000;

    // Check and validate the 'limit' as a number
    if (filter.role !== undefined) {
      const parsedRole = +filter.role; // Convert to number
      if (
        isNaN(parsedRole) ||
        !Number.isInteger(parsedRole) ||
        parsedRole < 0 ||
        parsedRole > MAX_LIMIT_VALUE
      ) {
        throw new BadRequestException(
          'Invalid role. Role must be a positive number.',
        );
      }
      filter.role = parsedRole;
    }

    return filter;
  }
}
