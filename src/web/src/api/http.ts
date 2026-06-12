/**
 * Cliente HTTP único da SPA. Toda I/O com o backend passa por aqui.
 *  - baseURL vem de VITE_API_BASE_URL (nunca hardcoded).
 *  - interceptor de request injeta Authorization: Bearer <access>.
 *  - interceptor de response normaliza o envelope de erro e tenta refresh em 401.
 *
 * A SPA NUNCA fala com a RAWG direto nem com o banco. Só /api/v1.
 */
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { sessionStore } from './session-store';
import { ApiError, normalizarErro } from './errors';
import { toastBus } from '../lib/toast-bus';
import type { RespostaAuth } from './types';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

// `silent` desliga o toast automático em chamadas cujas telas tratam o erro inline.
declare module 'axios' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AxiosRequestConfig {
    silent?: boolean;
  }
}

interface ConfigEstendida extends InternalAxiosRequestConfig {
  silent?: boolean;
  _jaTentouRefresh?: boolean;
}

export const http: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = sessionStore.getAccessToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

// Refresh single-flight: várias 401 concorrentes compartilham a mesma promessa.
let refreshEmAndamento: Promise<string | null> | null = null;

async function executarRefresh(): Promise<string | null> {
  const refreshToken = sessionStore.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<RespostaAuth>(
      `${baseURL}/auth/refresh`,
      { refresh_token: refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    sessionStore.atualizarTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    return null;
  }
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as ConfigEstendida | undefined;
    const status = error.response?.status;
    const url = config?.url ?? '';

    const ehRotaDeAuth = url.includes('/auth/login') || url.includes('/auth/refresh');

    // 401 em rota autenticada: tenta refresh uma única vez e repete a chamada.
    if (status === 401 && config && !config._jaTentouRefresh && !ehRotaDeAuth) {
      config._jaTentouRefresh = true;
      refreshEmAndamento = refreshEmAndamento ?? executarRefresh();
      const novoToken = await refreshEmAndamento;
      refreshEmAndamento = null;

      if (novoToken) {
        const headers = AxiosHeaders.from(config.headers);
        headers.set('Authorization', `Bearer ${novoToken}`);
        config.headers = headers;
        return http(config);
      }
      // Refresh falhou: encerra a sessão. RequireAuth redireciona ao login.
      sessionStore.limpar();
      toastBus.erro('Sessão expirada', 'Entre novamente para continuar.');
      return Promise.reject(new ApiError('NAO_AUTENTICADO', 'Sessão expirada.', 401));
    }

    const apiError = normalizarErro(status, error.response?.data);
    if (!config?.silent) {
      toastBus.erro(apiError.message, undefined, apiError.details);
    }
    return Promise.reject(apiError);
  },
);
