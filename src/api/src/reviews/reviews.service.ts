import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JogosService } from '../jogos/jogos.service';
import {
  ConflitoException,
  NaoEncontradoException,
  OwnershipException,
  RegraNegocioException,
} from '../common/exceptions/domain.exception';
import {
  buildPaginated,
  PaginatedResult,
  PaginationParams,
  toSkipTake,
} from '../common/pagination/paginate';
import { CriarReviewDto } from './dto/criar-review.dto';
import { EditarReviewDto } from './dto/editar-review.dto';

const INCLUDE_REVIEW = {
  jogo: { select: { id: true, rawgId: true, slug: true, nome: true, capaUrl: true } },
  usuario: { select: { id: true, nome: true } },
} as const;

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jogosService: JogosService,
  ) {}

  async criar(usuarioId: string, dto: CriarReviewDto) {
    this.validarNota(dto.nota);
    const jogo = await this.jogosService.garantirReferencia(dto.jogoSlug);

    const existente = await this.prisma.review.findUnique({
      where: { usuarioId_jogoId: { usuarioId, jogoId: jogo.id } },
    });
    if (existente) {
      throw new ConflitoException(
        'REVIEW_DUPLICADA',
        'Já existe uma review deste usuário para este jogo.',
      );
    }

    return this.prisma.review.create({
      data: {
        usuarioId,
        jogoId: jogo.id,
        nota: dto.nota,
        texto: dto.texto ?? null,
        spoiler: dto.spoiler,
      },
      include: INCLUDE_REVIEW,
    });
  }

  async editar(usuarioId: string, reviewId: string, dto: EditarReviewDto) {
    const review = await this.carregarComOwnership(usuarioId, reviewId);
    if (dto.nota !== undefined) {
      this.validarNota(dto.nota);
    }
    return this.prisma.review.update({
      where: { id: review.id },
      data: {
        ...(dto.nota !== undefined ? { nota: dto.nota } : {}),
        ...(dto.texto !== undefined ? { texto: dto.texto } : {}),
        ...(dto.spoiler !== undefined ? { spoiler: dto.spoiler } : {}),
      },
      include: INCLUDE_REVIEW,
    });
  }

  async excluir(usuarioId: string, reviewId: string): Promise<void> {
    const review = await this.carregarComOwnership(usuarioId, reviewId);
    await this.prisma.review.delete({ where: { id: review.id } });
  }

  /** Listagem pública: oculta reviews com oculto=true. */
  async listarPublicas(
    params: PaginationParams,
    basePath: string,
    jogoSlug?: string,
  ): Promise<PaginatedResult<unknown>> {
    const { skip, take } = toSkipTake(params);
    const where = {
      oculto: false,
      ...(jogoSlug ? { jogo: { slug: jogoSlug } } : {}),
    };
    const [results, count] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: INCLUDE_REVIEW,
      }),
      this.prisma.review.count({ where }),
    ]);
    const extra: Record<string, string> = jogoSlug ? { jogo: jogoSlug } : {};
    return buildPaginated(results, count, params, basePath, extra);
  }

  private validarNota(nota: number): void {
    if (!Number.isInteger(nota) || nota < 0 || nota > 10) {
      throw new RegraNegocioException(
        'NOTA_INVALIDA',
        'A nota da review deve ser um inteiro entre 0 e 10.',
      );
    }
  }

  private async carregarComOwnership(usuarioId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw new NaoEncontradoException('REVIEW_NAO_ENCONTRADA', 'Review não encontrada.');
    }
    if (review.usuarioId !== usuarioId) {
      throw new OwnershipException('Você só pode alterar suas próprias reviews.');
    }
    return review;
  }
}
