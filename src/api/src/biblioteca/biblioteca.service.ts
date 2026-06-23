import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ReferenciaJogoService } from '../jogos/referencia-jogo.service';
import {
  ConflitoException,
  NaoEncontradoException,
} from '../common/exceptions/domain.exception';
import { garantirEncontradoEDono } from '../common/authorization/ownership';
import {
  buildPaginated,
  PaginatedResult,
  PaginationParams,
  toSkipTake,
} from '../common/pagination/paginate';
import { ehViolacaoUnica } from '../common/prisma/prisma-erros';
import { AdicionarItemDto } from './dto/adicionar-item.dto';
import { AtualizarItemDto } from './dto/atualizar-item.dto';

const INCLUDE_JOGO = {
  jogo: { select: { id: true, rawgId: true, slug: true, nome: true, capaUrl: true } },
} as const;

@Injectable()
export class BibliotecaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly referenciaJogo: ReferenciaJogoService,
  ) {}

  async adicionar(usuarioId: string, dto: AdicionarItemDto) {
    const jogo = await this.referenciaJogo.garantir(dto.jogoSlug);

    const existente = await this.prisma.itemBiblioteca.findUnique({
      where: { usuarioId_jogoId: { usuarioId, jogoId: jogo.id } },
    });
    if (existente) {
      throw this.duplicado();
    }

    try {
      return await this.prisma.itemBiblioteca.create({
        data: {
          usuarioId,
          jogoId: jogo.id,
          status: dto.status,
          horasJogadas: dto.horasJogadas ?? 0,
        },
        include: INCLUDE_JOGO,
      });
    } catch (erro) {
      // Corrida: outra requisição inseriu o mesmo item entre o findUnique e o create.
      if (ehViolacaoUnica(erro)) {
        throw this.duplicado();
      }
      throw erro;
    }
  }

  private duplicado(): ConflitoException {
    return new ConflitoException(
      'ITEM_BIBLIOTECA_DUPLICADO',
      'Este jogo já está na sua biblioteca.',
    );
  }

  async atualizar(usuarioId: string, itemId: string, dto: AtualizarItemDto) {
    const item = await this.carregarComOwnership(usuarioId, itemId);
    return this.prisma.itemBiblioteca.update({
      where: { id: item.id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.horasJogadas !== undefined ? { horasJogadas: dto.horasJogadas } : {}),
      },
      include: INCLUDE_JOGO,
    });
  }

  async remover(usuarioId: string, itemId: string): Promise<void> {
    const item = await this.carregarComOwnership(usuarioId, itemId);
    await this.prisma.itemBiblioteca.delete({ where: { id: item.id } });
  }

  async listarDoUsuario(
    usuarioId: string,
    params: PaginationParams,
    basePath: string,
  ): Promise<PaginatedResult<unknown>> {
    const { skip, take } = toSkipTake(params);
    const [results, count] = await Promise.all([
      this.prisma.itemBiblioteca.findMany({
        where: { usuarioId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: INCLUDE_JOGO,
      }),
      this.prisma.itemBiblioteca.count({ where: { usuarioId } }),
    ]);
    return buildPaginated(results, count, params, basePath);
  }

  /** Carrega o item e valida ownership (403 se não for do usuário). */
  private async carregarComOwnership(usuarioId: string, itemId: string) {
    const item = await this.prisma.itemBiblioteca.findUnique({ where: { id: itemId } });
    return garantirEncontradoEDono(
      item,
      new NaoEncontradoException(
        'ITEM_BIBLIOTECA_NAO_ENCONTRADO',
        'Item de biblioteca não encontrado.',
      ),
      usuarioId,
      'Você só pode alterar itens da sua própria biblioteca.',
    );
  }
}
