import { Inject, Injectable } from '@nestjs/common';
import { CacheService } from '../common/cache/cache.service';
import {
  buildPaginated,
  PaginatedResult,
  PaginationParams,
} from '../common/pagination/paginate';
import { JogoDetalhe, JogoResumo, RAWG_CLIENT, RawgClient } from './rawg/rawg.types';

/**
 * Catálogo via RAWG real, com cache-aside in-process sobre o RawgClient.
 * Leitura apenas; a persistência da referência mínima Jogo vive em
 * ReferenciaJogoService.
 */
@Injectable()
export class JogosService {
  constructor(
    @Inject(RAWG_CLIENT) private readonly rawg: RawgClient,
    private readonly cache: CacheService,
  ) {}

  /** Busca paginada no catálogo. Cache-aside por (search, page, page_size). */
  async buscar(
    params: PaginationParams & { search?: string },
    basePath: string,
  ): Promise<PaginatedResult<JogoResumo>> {
    const search = params.search ?? '';
    const chave = `rawg:busca:${search}:${params.page}:${params.page_size}`;

    const cacheado = await this.cache.get<{ count: number; results: JogoResumo[] }>(chave);
    const dados =
      cacheado ??
      (await this.rawg.buscar({
        search,
        page: params.page,
        page_size: params.page_size,
      }));
    if (!cacheado) {
      await this.cache.set(chave, dados);
    }

    const extraQuery: Record<string, string> = search ? { search } : {};
    return buildPaginated(dados.results, dados.count, params, basePath, extraQuery);
  }

  /** Detalhe rico de um jogo. Cache-aside por slug. */
  async detalhe(slug: string): Promise<JogoDetalhe> {
    const chave = `rawg:detalhe:${slug}`;
    const cacheado = await this.cache.get<JogoDetalhe>(chave);
    if (cacheado) {
      return cacheado;
    }
    const detalhe = await this.rawg.detalhe(slug);
    await this.cache.set(chave, detalhe);
    return detalhe;
  }
}
