import { SetMetadata } from '@nestjs/common';
import { ROLE } from 'src/users/constants';

export const ROLES_KEY = 'roles';
export const RolesDecorator = (...roles: ROLE[]) =>
  SetMetadata(ROLES_KEY, roles);
