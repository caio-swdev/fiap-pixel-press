import { Injectable } from '@nestjs/common';
import { NaoEncontradoException } from '../../common/exceptions/domain.exception';
import {
  JogoDetalhe,
  ParametrosBusca,
  RawgClient,
  ResultadoBusca,
} from './rawg.types';
import fixture from './jogos.fixture.json';

/**
 * Fallback offline (USE_RAWG_MOCK=true). Serve a fixture local de jogos reais da RAWG.
 * Rede de segurança para a apresentação ao vivo caso internet/chave falhem.
 */
@Injectable()
export class MockRawgClient implements RawgClient {
  private readonly jogos: JogoDetalhe[] = fixture as JogoDetalhe[];

  async buscar(params: ParametrosBusca): Promise<ResultadoBusca> {
    const termo = (params.search ?? '').trim().toLowerCase();
    const filtrados = termo
      ? this.jogos.filter(
          (j) => j.nome.toLowerCase().includes(termo) || j.slug.includes(termo),
        )
      : this.jogos;

    const inicio = (params.page - 1) * params.page_size;
    const pagina = filtrados.slice(inicio, inicio + params.page_size);

    return {
      count: filtrados.length,
      results: pagina.map((j) => ({
        rawgId: j.rawgId,
        slug: j.slug,
        nome: j.nome,
        capaUrl: j.capaUrl,
      })),
    };
  }

  async detalhe(slug: string): Promise<JogoDetalhe> {
    const jogo = this.jogos.find((j) => j.slug === slug);
    if (!jogo) {
      throw new NaoEncontradoException('JOGO_NAO_ENCONTRADO', 'Jogo não encontrado no catálogo.');
    }
    return jogo;
  }
}
