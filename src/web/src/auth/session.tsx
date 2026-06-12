/**
 * Contexto de sessão da SPA. Espelha o sessionStore (localStorage) e expõe
 * o usuário atual + ações de login/logout para a árvore React.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { sessionStore, type Sessao } from '../api/session-store';
import * as api from '../api/endpoints';
import type { LoginPayload, Papel, UsuarioSessao } from '../api/types';

interface SessionContextValue {
  usuario: UsuarioSessao | null;
  autenticado: boolean;
  entrar: (payload: LoginPayload) => Promise<void>;
  sair: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(() => sessionStore.obter());

  // Sincroniza com o store (refresh/logout disparados pelo interceptor do axios).
  useEffect(() => sessionStore.subscribe(setSessao), []);

  const entrar = useCallback(async (payload: LoginPayload) => {
    const resposta = await api.login(payload);
    sessionStore.salvar({
      accessToken: resposta.access_token,
      refreshToken: resposta.refresh_token,
      usuario: resposta.usuario,
    });
  }, []);

  const sair = useCallback(() => {
    sessionStore.limpar();
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      usuario: sessao?.usuario ?? null,
      autenticado: sessao !== null,
      entrar,
      sair,
    }),
    [sessao, entrar, sair],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession deve ser usado dentro de <SessionProvider>.');
  return ctx;
}

/** Hierarquia de papéis: ADMIN ⊇ MODERADOR ⊇ USUARIO. */
const NIVEL: Record<Papel, number> = { USUARIO: 1, MODERADOR: 2, ADMIN: 3 };

export function temPapel(papel: Papel | undefined, minimo: Papel): boolean {
  if (!papel) return false;
  return NIVEL[papel] >= NIVEL[minimo];
}
