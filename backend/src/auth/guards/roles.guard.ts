import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    console.log('User in RolesGuard:', user); // Added log
    
    if (!user) {
      return false;
    }

    const normalizedUserRole = user.role ? String(user.role).toLowerCase() : '';

    return requiredRoles.some((role) => {
      return normalizedUserRole === String(role).toLowerCase();
    });
  }
}
