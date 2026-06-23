/**
 * Fonte única do prefixo global da API. main.ts o aplica via setGlobalPrefix;
 * os controllers montam o basePath de paginação com apiPath(). Evita repetir
 * a string '/api/v1' espalhada (drift se a versão mudar).
 */
export const API_PREFIX = 'api/v1';

/** basePath absoluto de um recurso, ex.: apiPath('reviews') → '/api/v1/reviews'. */
export function apiPath(recurso: string): string {
  return `/${API_PREFIX}/${recurso}`;
}
