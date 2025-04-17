import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { Reflector } from '@nestjs/core';
import { ROLE } from 'src/user/constants';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireRoles =
      this.reflector.getAllAndOverride<ROLE[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    if (!requireRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requireRoles.includes(user?.roleId);
  }
}
