import { SetMetadata } from '@nestjs/common';
import { ROLE } from 'src/user/constants';

export const ROLES_KEY = 'roles';
export const RolesDecorator = (...roles: ROLE[]) =>
  SetMetadata(ROLES_KEY, roles);
