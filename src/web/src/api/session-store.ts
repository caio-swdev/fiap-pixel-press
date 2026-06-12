/**
 * Fonte de verdade da sessão no browser, fora do React, para que o interceptor
 * do axios leia/escreva tokens sem depender da árvore de componentes.
 *
 * DESVIO CONSCIENTE (registrado no relatório): tokens em localStorage nesta demo.
 * Em produção, cookie httpOnly seria o ideal (exigiria ajuste de CORS no backend).
 */
import type { UsuarioSessao } from './types';

const CHAVE_ACCESS = 'pixelpress.access';
const CHAVE_REFRESH = 'pixelpress.refresh';
const CHAVE_USUARIO = 'pixelpress.usuario';

export interface Sessao {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioSessao;
}

type Listener = (sessao: Sessao | null) => void;
const listeners = new Set<Listener>();

function ler(): Sessao | null {
  const accessToken = localStorage.getItem(CHAVE_ACCESS);
  const refreshToken = localStorage.getItem(CHAVE_REFRESH);
  const usuarioRaw = localStorage.getItem(CHAVE_USUARIO);
  if (!accessToken || !refreshToken || !usuarioRaw) return null;
  try {
    const usuario = JSON.parse(usuarioRaw) as UsuarioSessao;
    return { accessToken, refreshToken, usuario };
  } catch {
    return null;
  }
}

function notificar(sessao: Sessao | null): void {
  listeners.forEach((l) => l(sessao));
}

export const sessionStore = {
  obter: ler,
  getAccessToken(): string | null {
    return localStorage.getItem(CHAVE_ACCESS);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(CHAVE_REFRESH);
  },
  salvar(sessao: Sessao): void {
    localStorage.setItem(CHAVE_ACCESS, sessao.accessToken);
    localStorage.setItem(CHAVE_REFRESH, sessao.refreshToken);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(sessao.usuario));
    notificar(sessao);
  },
  /** Atualiza apenas os tokens (após refresh), preservando o usuário. */
  atualizarTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(CHAVE_ACCESS, accessToken);
    localStorage.setItem(CHAVE_REFRESH, refreshToken);
    notificar(ler());
  },
  limpar(): void {
    localStorage.removeItem(CHAVE_ACCESS);
    localStorage.removeItem(CHAVE_REFRESH);
    localStorage.removeItem(CHAVE_USUARIO);
    notificar(null);
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
