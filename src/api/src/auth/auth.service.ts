import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConflitoException } from '../common/exceptions/domain.exception';
import { Papel } from '../common/enums/papel.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface TokenPayload {
  sub: string;
  email: string;
  papel: string;
}

export interface AuthResposta {
  access_token: string;
  refresh_token: string;
  usuario: { id: string; email: string; nome: string; papel: string };
}

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async registrar(dto: RegisterDto): Promise<AuthResposta> {
    const existente = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existente) {
      throw new ConflitoException('EMAIL_DUPLICADO', 'Já existe um usuário com este e-mail.');
    }
    const senhaHash = await bcrypt.hash(dto.senha, SALT_ROUNDS);
    const usuario = await this.prisma.usuario.create({
      data: { email: dto.email, nome: dto.nome, senhaHash, papel: Papel.USUARIO },
    });
    return this.emitirTokens(usuario);
  }

  async login(dto: LoginDto): Promise<AuthResposta> {
    const usuario = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    const senhaOk = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaOk) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    return this.emitirTokens(usuario);
  }

  async refresh(refreshToken: string): Promise<AuthResposta> {
    let payload: TokenPayload & { tipo?: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }
    if (payload.tipo !== 'refresh') {
      throw new UnauthorizedException('Token informado não é um refresh token.');
    }
    const usuario = await this.prisma.usuario.findUnique({ where: { id: payload.sub } });
    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário inválido ou inativo.');
    }
    return this.emitirTokens(usuario);
  }

  private async emitirTokens(usuario: {
    id: string;
    email: string;
    nome: string;
    papel: string;
  }): Promise<AuthResposta> {
    const payload: TokenPayload = {
      sub: usuario.id,
      email: usuario.email,
      papel: usuario.papel,
    };
    const access_token = await this.jwt.signAsync(
      { ...payload, tipo: 'access' },
      { expiresIn: this.config.getOrThrow<string>('JWT_EXPIRATION') },
    );
    const refresh_token = await this.jwt.signAsync(
      { ...payload, tipo: 'refresh' },
      { expiresIn: this.config.getOrThrow<string>('JWT_REFRESH_EXPIRATION') },
    );
    return {
      access_token,
      refresh_token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        papel: usuario.papel,
      },
    };
  }
}
