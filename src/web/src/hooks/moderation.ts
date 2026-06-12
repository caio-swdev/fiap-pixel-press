import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/endpoints';
import { toastBus } from '../lib/toast-bus';
import type { CriarDenunciaPayload } from '../api/types';

export function useReports(page: number) {
  return useQuery({
    queryKey: ['reports', page],
    queryFn: () => api.denunciasPendentes({ page, page_size: 20 }),
  });
}

export function useReport() {
  return useMutation({
    mutationFn: (payload: CriarDenunciaPayload) => api.denunciar(payload),
    onSuccess: () => {
      toastBus.sucesso('Denúncia registrada', 'A moderação vai analisar.');
    },
  });
}

export function useHideReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      api.ocultarReview(id, { motivo }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reports'] });
      void qc.invalidateQueries({ queryKey: ['reviews'] });
      toastBus.sucesso('Review ocultada', 'Removida das listagens públicas.');
    },
  });
}
