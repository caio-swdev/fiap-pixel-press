/**
 * Funções de acesso à API, tipadas por recurso. São a única ponte entre os
 * hooks de dados e o axios. Componentes nunca chamam isto direto.
 */
import { http } from './http';
import type {
  AdicionarBibliotecaPayload,
  AtualizarBibliotecaPayload,
  CriarDenunciaPayload,
  CriarReviewPayload,
  Denuncia,
  EditarReviewPayload,
  ItemBiblioteca,
  JogoDetalhe,
  JogoResumo,
  LoginPayload,
  OcultarReviewPayload,
  Paginado,
  Papel,
  RespostaAuth,
  Review,
  Usuario,
} from './types';

// ---- Auth ----
export async function login(payload: LoginPayload): Promise<RespostaAuth> {
  // silent: a tela de login mostra o erro inline, sem toast duplicado.
  const { data } = await http.post<RespostaAuth>('/auth/login', payload, { silent: true });
  return data;
}

// ---- Catálogo ----
export async function buscarJogos(params: {
  search?: string;
  page: number;
  page_size: number;
}): Promise<Paginado<JogoResumo>> {
  const { data } = await http.get<Paginado<JogoResumo>>('/games', { params });
  return data;
}

export async function detalheJogo(slug: string): Promise<JogoDetalhe> {
  const { data } = await http.get<JogoDetalhe>(`/games/${slug}`);
  return data;
}

// ---- Biblioteca ----
export async function minhaBiblioteca(params: {
  page: number;
  page_size: number;
}): Promise<Paginado<ItemBiblioteca>> {
  const { data } = await http.get<Paginado<ItemBiblioteca>>('/biblioteca/me', { params });
  return data;
}

export async function adicionarBiblioteca(
  payload: AdicionarBibliotecaPayload,
): Promise<ItemBiblioteca> {
  const { data } = await http.post<ItemBiblioteca>('/biblioteca', payload);
  return data;
}

export async function atualizarBiblioteca(
  id: string,
  payload: AtualizarBibliotecaPayload,
): Promise<ItemBiblioteca> {
  const { data } = await http.patch<ItemBiblioteca>(`/biblioteca/${id}`, payload);
  return data;
}

export async function removerBiblioteca(id: string): Promise<void> {
  await http.delete(`/biblioteca/${id}`);
}

// ---- Reviews ----
export async function listarReviews(
  jogoSlug: string,
  params: { page: number; page_size: number },
): Promise<Paginado<Review>> {
  const { data } = await http.get<Paginado<Review>>('/reviews', {
    params: { jogo: jogoSlug, ...params },
  });
  return data;
}

export async function criarReview(payload: CriarReviewPayload): Promise<Review> {
  const { data } = await http.post<Review>('/reviews', payload);
  return data;
}

export async function editarReview(id: string, payload: EditarReviewPayload): Promise<Review> {
  const { data } = await http.patch<Review>(`/reviews/${id}`, payload);
  return data;
}

export async function excluirReview(id: string): Promise<void> {
  await http.delete(`/reviews/${id}`);
}

export async function ocultarReview(id: string, payload: OcultarReviewPayload): Promise<void> {
  await http.patch(`/reviews/${id}/hide`, payload);
}

// ---- Moderação ----
export async function denunciar(payload: CriarDenunciaPayload): Promise<Denuncia> {
  const { data } = await http.post<Denuncia>('/reports', payload);
  return data;
}

export async function denunciasPendentes(params: {
  page: number;
  page_size: number;
}): Promise<Paginado<Denuncia>> {
  const { data } = await http.get<Paginado<Denuncia>>('/moderation/reports', {
    params: { status: 'PENDENTE', ...params },
  });
  return data;
}

// ---- Usuários (Admin) ----
export async function listarUsuarios(params: {
  page: number;
  page_size: number;
}): Promise<Paginado<Usuario>> {
  const { data } = await http.get<Paginado<Usuario>>('/usuarios', { params });
  return data;
}

export async function atribuirPapel(id: string, papel: Papel): Promise<Usuario> {
  const { data } = await http.patch<Usuario>(`/usuarios/${id}/papel`, { papel });
  return data;
}
