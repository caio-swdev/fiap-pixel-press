export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginationParams {
  page: number;
  page_size: number;
}

/** Converte page/page_size em skip/take do Prisma. */
export function toSkipTake(params: PaginationParams): { skip: number; take: number } {
  return { skip: (params.page - 1) * params.page_size, take: params.page_size };
}

/**
 * Monta o envelope de paginação de standards.md
 * ({ count, next, previous, results }) com URLs absolutas de path + query.
 */
export function buildPaginated<T>(
  results: T[],
  count: number,
  params: PaginationParams,
  basePath: string,
  extraQuery: Record<string, string> = {},
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(count / params.page_size));
  const montarUrl = (page: number): string => {
    const qs = new URLSearchParams({
      ...extraQuery,
      page: String(page),
      page_size: String(params.page_size),
    });
    return `${basePath}?${qs.toString()}`;
  };

  return {
    count,
    next: params.page < totalPages ? montarUrl(params.page + 1) : null,
    previous: params.page > 1 ? montarUrl(params.page - 1) : null,
    results,
  };
}
