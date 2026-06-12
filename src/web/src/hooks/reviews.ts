import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/endpoints';
import { toastBus } from '../lib/toast-bus';
import type { CriarReviewPayload, EditarReviewPayload } from '../api/types';

export function useReviews(jogoSlug: string, page: number) {
  return useQuery({
    queryKey: ['reviews', jogoSlug, page],
    queryFn: () => api.listarReviews(jogoSlug, { page, page_size: 20 }),
    enabled: Boolean(jogoSlug),
  });
}

function invalidarReviews(qc: ReturnType<typeof useQueryClient>): void {
  void qc.invalidateQueries({ queryKey: ['reviews'] });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarReviewPayload) => api.criarReview(payload),
    onSuccess: () => {
      invalidarReviews(qc);
      toastBus.sucesso('Review publicada');
    },
  });
}

export function useEditReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditarReviewPayload }) =>
      api.editarReview(id, payload),
    onSuccess: () => {
      invalidarReviews(qc);
      toastBus.sucesso('Review atualizada');
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.excluirReview(id),
    onSuccess: () => {
      invalidarReviews(qc);
      toastBus.sucesso('Review excluída');
    },
  });
}
