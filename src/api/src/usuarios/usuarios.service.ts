import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NaoEncontradoException } from '../common/exceptions/domain.exception';
import { Papel } from '../common/enums/papel.enum';
import {
  buildPaginated,
  PaginatedResult,
  PaginationParams,
  toSkipTake,
} from '../common/pagination/paginate';
import { AtualizarPerfilDto } from './dto/atualizar-perfil.dto';

/** Projeção pública do usuário (nunca expõe senhaHash). */
const SELECT_PERFIL = {
  id: true,
  email: true,
  nome: true,
  papel: true,
  ativo: true,
  createdAt: true,
} as const;

type PerfilUsuario = {
  id: string;
  email: string;
  nome: string;
  papel: string;
  ativo: boolean;
  createdAt: Date;
};

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: string): Promise<PerfilUsuario> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: SELECT_PERFIL,
    });
    if (!usuario) {
      throw new NaoEncontradoException('USUARIO_NAO_ENCONTRADO', 'Usuário não encontrado.');
    }
    return usuario;
  }

  async atualizarPerfil(id: string, dto: AtualizarPerfilDto): Promise<PerfilUsuario> {
    await this.buscarPorId(id);
    return this.prisma.usuario.update({
      where: { id },
      data: { ...(dto.nome !== undefined ? { nome: dto.nome } : {}) },
      select: SELECT_PERFIL,
    });
  }

  async atribuirPapel(id: string, papel: Papel): Promise<PerfilUsuario> {
    await this.buscarPorId(id);
    return this.prisma.usuario.update({
      where: { id },
      data: { papel },
      select: SELECT_PERFIL,
    });
  }

  async listar(
    params: PaginationParams,
    basePath: string,
  ): Promise<PaginatedResult<PerfilUsuario>> {
    const { skip, take } = toSkipTake(params);
    const [results, count] = await Promise.all([
      this.prisma.usuario.findMany({ skip, take, orderBy: { createdAt: 'asc' }, select: SELECT_PERFIL }),
      this.prisma.usuario.count(),
    ]);
    return buildPaginated(results, count, params, basePath);
  }
}
