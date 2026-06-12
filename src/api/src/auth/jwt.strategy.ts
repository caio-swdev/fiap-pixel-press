import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { UsuarioAutenticado } from '../common/decorators/usuario-atual.decorator';

interface JwtPayload {
  sub: string;
  email: string;
  papel: string;
  tipo?: 'access' | 'refresh';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /** Valida o token e popula req.user. Recusa tokens de refresh e usuários inativos. */
  async validate(payload: JwtPayload): Promise<UsuarioAutenticado> {
    if (payload.tipo === 'refresh') {
      throw new UnauthorizedException('Token de refresh não pode acessar recursos.');
    }
    const usuario = await this.prisma.usuario.findUnique({ where: { id: payload.sub } });
    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário inválido ou inativo.');
    }
    return { id: usuario.id, email: usuario.email, papel: usuario.papel };
  }
}
