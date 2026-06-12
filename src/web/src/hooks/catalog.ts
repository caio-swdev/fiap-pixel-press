import { keepPreviousData, useQuery } from '@tanstack/react-query';
import * as api from '../api/endpoints';
import { qk } from './keys';

const PAGE_SIZE = 12;

export function useGames(search: string, page: number) {
  return useQuery({
    queryKey: qk.games(search, page),
    queryFn: () => api.buscarJogos({ search: search || undefined, page, page_size: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });
}

export function useGameDetail(slug: string) {
  return useQuery({
    queryKey: qk.gameDetail(slug),
    queryFn: () => api.detalheJogo(slug),
    enabled: Boolean(slug),
  });
}

export { PAGE_SIZE as CATALOG_PAGE_SIZE };
