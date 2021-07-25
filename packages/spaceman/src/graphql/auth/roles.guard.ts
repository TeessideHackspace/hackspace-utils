import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);

    const actualPermissions = this.getPermissions(ctx);
    const requiredPermissions =
      this.reflector.get<string[]>('roles', context.getHandler()) || [];

    for (const permission of requiredPermissions) {
      if (!actualPermissions?.includes(permission)) {
        return false;
      }
    }
    return true;
  }

  private getPermissions(ctx: GqlExecutionContext): string[] {
    const user = ctx.getContext()?.user;
    const roles = user[process.env.ROLES_CLAIM!];
    if (roles !== undefined) {
      try {
        return JSON.parse(roles);
      } catch (e) {
        return roles.split(',');
      }
    }
    return [];
  }
}
