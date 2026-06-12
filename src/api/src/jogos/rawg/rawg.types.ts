/** Referência mínima de um jogo, normalizada a partir da RAWG. */
export interface JogoResumo {
  rawgId: number;
  slug: string;
  nome: string;
  capaUrl: string | null;
}

/** Detalhe rico, buscado sob demanda da RAWG e nunca persistido. */
export interface JogoDetalhe extends JogoResumo {
  descricao: string | null;
  lancamento: string | null;
  metacritic: number | null;
  rating: number | null;
  generos: string[];
  plataformas: string[];
  screenshots: string[];
}

export interface ResultadoBusca {
  count: number;
  results: JogoResumo[];
}

export interface ParametrosBusca {
  search?: string;
  page: number;
  page_size: number;
}

/** Contrato de catálogo. Implementado por HttpRawgClient (real) e MockRawgClient (fallback). */
export interface RawgClient {
  buscar(params: ParametrosBusca): Promise<ResultadoBusca>;
  detalhe(slug: string): Promise<JogoDetalhe>;
}

/** Token de injeção do RawgClient (factory escolhe a implementação por USE_RAWG_MOCK). */
export const RAWG_CLIENT = Symbol('RAWG_CLIENT');
