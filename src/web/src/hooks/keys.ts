/** Chaves de cache centralizadas do TanStack Query. */
export const qk = {
  games: (search: string, page: number) => ['games', search, page] as const,
  gameDetail: (slug: string) => ['game', slug] as const,
  biblioteca: (page: number) => ['biblioteca', page] as const,
  reviews: (slug: string, page: number) => ['reviews', slug, page] as const,
  reports: (page: number) => ['reports', page] as const,
  usuarios: (page: number) => ['usuarios', page] as const,
};
