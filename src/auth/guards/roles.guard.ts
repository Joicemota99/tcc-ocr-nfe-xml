import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from 'src/roles/entities/role.entity';

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
    const userRoleName = user?.role?.name; 

    if (!userRoleName) {
        throw new ForbiddenException('Você não possui um cargo definido para acessar este recurso.');
    }
    const hasPermission = requiredRoles.some((role) => role === userRoleName);

    if (!hasPermission) {
        throw new ForbiddenException(
            `Acesso negado. Apenas os cargos (${requiredRoles.join(', ')}) podem gerenciar este recurso.`
        );
    }
    return true; 
  }
}