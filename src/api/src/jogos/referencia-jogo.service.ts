import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { JogosService } from './jogos.service';

/** Referência mínima de um jogo persistida no banco. */
export interface ReferenciaJogo {
  id: string;
  rawgId: number;
  slug: string;
  nome: string;
  capaUrl: string | null;
}

/**
 * Materializa no banco a referência mínima de um jogo do catálogo (upsert no
 * primeiro uso). Separado do JogosService de propósito: catálogo lê (cache-aside
 * sobre a RAWG), esta classe persiste. Usada por biblioteca/reviews ao referenciar
 * um jogo do catálogo.
 */
@Injectable()
export class ReferenciaJogoService {
  constructor(
    private readonly jogosService: JogosService,
    private readonly prisma: PrismaService,
  ) {}

  async garantir(slug: string): Promise<ReferenciaJogo> {
    const detalhe = await this.jogosService.detalhe(slug);
    return this.prisma.jogo.upsert({
      where: { rawgId: detalhe.rawgId },
      update: { slug: detalhe.slug, nome: detalhe.nome, capaUrl: detalhe.capaUrl },
      create: {
        rawgId: detalhe.rawgId,
        slug: detalhe.slug,
        nome: detalhe.nome,
        capaUrl: detalhe.capaUrl,
      },
      select: { id: true, rawgId: true, slug: true, nome: true, capaUrl: true },
    });
  }
}
