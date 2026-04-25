import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Activate the JWT authentication
    const activate = (await super.canActivate(context)) as boolean;
    
    // Attach user to request object
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return activate;
  }
}
