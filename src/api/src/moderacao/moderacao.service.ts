import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NaoEncontradoException } from '../common/exceptions/domain.exception';
import { StatusDenuncia } from '../common/enums/status-denuncia.enum';
import {
  buildPaginated,
  PaginatedResult,
  PaginationParams,
  toSkipTake,
} from '../common/pagination/paginate';
import { CriarDenunciaDto } from './dto/criar-denuncia.dto';

@Injectable()
export class ModeracaoService {
  constructor(private readonly prisma: PrismaService) {}

  /** Usuário registrado cria denúncia de uma review. Status inicial PENDENTE. */
  async criarDenuncia(denuncianteId: string, dto: CriarDenunciaDto) {
    const review = await this.prisma.review.findUnique({ where: { id: dto.reviewId } });
    if (!review) {
      throw new NaoEncontradoException('REVIEW_NAO_ENCONTRADA', 'Review denunciada não existe.');
    }
    return this.prisma.denuncia.create({
      data: {
        reviewId: dto.reviewId,
        denuncianteId,
        motivo: dto.motivo,
        status: StatusDenuncia.PENDENTE,
      },
    });
  }

  /** Moderador lista denúncias pendentes. */
  async listarPendentes(
    params: PaginationParams,
    basePath: string,
  ): Promise<PaginatedResult<unknown>> {
    const { skip, take } = toSkipTake(params);
    const where = { status: StatusDenuncia.PENDENTE };
    const [results, count] = await Promise.all([
      this.prisma.denuncia.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'asc' },
        include: {
          review: { include: { jogo: { select: { slug: true, nome: true } } } },
          denunciante: { select: { id: true, nome: true } },
        },
      }),
      this.prisma.denuncia.count({ where }),
    ]);
    return buildPaginated(results, count, params, basePath, {
      status: StatusDenuncia.PENDENTE,
    });
  }

  /**
   * Soft-delete de moderação: oculta a review (oculto=true, motivo, ocultadoPorId)
   * e marca as denúncias pendentes dela como RESOLVIDA. Não apaga o conteúdo.
   */
  async ocultarReview(moderadorId: string, reviewId: string, motivo: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw new NaoEncontradoException('REVIEW_NAO_ENCONTRADA', 'Review não encontrada.');
    }

    const [reviewOculta] = await this.prisma.$transaction([
      this.prisma.review.update({
        where: { id: reviewId },
        data: {
          oculto: true,
          motivoOcultacao: motivo,
          ocultadoPorId: moderadorId,
        },
      }),
      this.prisma.denuncia.updateMany({
        where: { reviewId, status: StatusDenuncia.PENDENTE },
        data: { status: StatusDenuncia.RESOLVIDA },
      }),
    ]);

    return {
      id: reviewOculta.id,
      oculto: reviewOculta.oculto,
      motivoOcultacao: reviewOculta.motivoOcultacao,
      ocultadoPorId: reviewOculta.ocultadoPorId,
    };
  }
}
