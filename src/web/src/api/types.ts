/**
 * Tipos do domínio PixelPress, espelhando os DTOs/respostas do backend (/api/v1).
 * Nomenclatura em português, consistente com o backend. Sem `any`.
 */

export type Papel = 'USUARIO' | 'MODERADOR' | 'ADMIN';

export type StatusBiblioteca =
  | 'JOGANDO'
  | 'ZERADO'
  | 'QUERO_JOGAR'
  | 'DROPEI'
  | 'PLATINADO';

export type StatusDenuncia = 'PENDENTE' | 'RESOLVIDA';

/** Envelope de paginação (standards.md): count/next/previous/results. */
export interface Paginado<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  papel: Papel;
  ativo: boolean;
  createdAt: string;
}

/** Usuário embutido em sessão (resposta de login/refresh). */
export interface UsuarioSessao {
  id: string;
  email: string;
  nome: string;
  papel: Papel;
}

export interface RespostaAuth {
  access_token: string;
  refresh_token: string;
  usuario: UsuarioSessao;
}

/** Referência mínima de jogo (catálogo e relações). */
export interface JogoResumo {
  rawgId: number;
  slug: string;
  nome: string;
  capaUrl: string | null;
}

/** Detalhe rico do catálogo (RAWG sob demanda). */
export interface JogoDetalhe extends JogoResumo {
  descricao: string | null;
  lancamento: string | null;
  metacritic: number | null;
  rating: number | null;
  generos: string[];
  plataformas: string[];
  screenshots: string[];
}

/** Referência de jogo persistida (embutida em biblioteca/review). */
export interface JogoRef {
  id: string;
  rawgId: number;
  slug: string;
  nome: string;
  capaUrl: string | null;
}

export interface ItemBiblioteca {
  id: string;
  status: StatusBiblioteca;
  horasJogadas: number;
  usuarioId: string;
  jogoId: string;
  createdAt: string;
  updatedAt: string;
  jogo: JogoRef;
}

export interface Review {
  id: string;
  nota: number;
  texto: string | null;
  spoiler: boolean;
  oculto: boolean;
  motivoOcultacao: string | null;
  ocultadoPorId: string | null;
  usuarioId: string;
  jogoId: string;
  createdAt: string;
  updatedAt: string;
  jogo: JogoRef;
  usuario: { id: string; nome: string };
}

export interface Denuncia {
  id: string;
  motivo: string;
  status: StatusDenuncia;
  reviewId: string;
  denuncianteId: string;
  createdAt: string;
  updatedAt: string;
  review: Review & { jogo: Pick<JogoRef, 'slug' | 'nome'> };
  denunciante: { id: string; nome: string };
}

// ---- Payloads de escrita ----

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  email: string;
  nome: string;
  senha: string;
}

export interface AdicionarBibliotecaPayload {
  jogoSlug: string;
  status: StatusBiblioteca;
  horasJogadas?: number;
}

export interface AtualizarBibliotecaPayload {
  status?: StatusBiblioteca;
  horasJogadas?: number;
}

export interface CriarReviewPayload {
  jogoSlug: string;
  nota: number;
  texto?: string;
  spoiler: boolean;
}

export interface EditarReviewPayload {
  nota?: number;
  texto?: string;
  spoiler?: boolean;
}

export interface CriarDenunciaPayload {
  reviewId: string;
  motivo: string;
}

export interface OcultarReviewPayload {
  motivo: string;
}
