import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { NIVEL_PAPEL, Papel } from '../enums/papel.enum';
import { UsuarioAutenticado } from '../decorators/usuario-atual.decorator';

/**
 * RBAC hierárquico (ADMIN ⊇ MODERADOR ⊇ USUARIO).
 * Lê o papel do JWT e exige que ele seja >= ao menor papel declarado em @Roles().
 * Usado junto com JwtAuthGuard (a autenticação garante req.user).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const papeisExigidos = this.reflector.getAllAndOverride<Papel[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!papeisExigidos || papeisExigidos.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: UsuarioAutenticado }>();
    const usuario = request.user;
    if (!usuario) {
      throw new ForbiddenException('Usuário sem papel definido.');
    }

    const nivelUsuario = NIVEL_PAPEL[usuario.papel as Papel] ?? 0;
    const nivelMinimo = Math.min(...papeisExigidos.map((p) => NIVEL_PAPEL[p]));

    if (nivelUsuario < nivelMinimo) {
      throw new ForbiddenException('Papel insuficiente para esta operação.');
    }
    return true;
  }
}
