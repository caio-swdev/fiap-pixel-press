import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Payload do usuário autenticado, extraído do JWT pela JwtStrategy. */
export interface UsuarioAutenticado {
  id: string;
  email: string;
  papel: string;
}

/** Injeta o usuário autenticado (req.user) num parâmetro do controller. */
export const UsuarioAtual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioAutenticado => {
    const request = ctx.switchToHttp().getRequest<{ user: UsuarioAutenticado }>();
    return request.user;
  },
);
