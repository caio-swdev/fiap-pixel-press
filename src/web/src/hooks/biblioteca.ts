import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/endpoints';
import { toastBus } from '../lib/toast-bus';
import type {
  AdicionarBibliotecaPayload,
  AtualizarBibliotecaPayload,
} from '../api/types';

export function useMinhaBiblioteca(page: number) {
  return useQuery({
    queryKey: ['biblioteca', page],
    queryFn: () => api.minhaBiblioteca({ page, page_size: 24 }),
  });
}

function invalidarBiblioteca(qc: ReturnType<typeof useQueryClient>): void {
  void qc.invalidateQueries({ queryKey: ['biblioteca'] });
}

export function useAddBiblioteca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdicionarBibliotecaPayload) => api.adicionarBiblioteca(payload),
    onSuccess: (item) => {
      invalidarBiblioteca(qc);
      toastBus.sucesso('Adicionado à biblioteca', item.jogo.nome);
    },
  });
}

export function useUpdateBiblioteca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AtualizarBibliotecaPayload }) =>
      api.atualizarBiblioteca(id, payload),
    onSuccess: () => {
      invalidarBiblioteca(qc);
      toastBus.sucesso('Biblioteca atualizada');
    },
  });
}

export function useRemoveBiblioteca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.removerBiblioteca(id),
    onSuccess: () => {
      invalidarBiblioteca(qc);
      toastBus.sucesso('Removido da biblioteca');
    },
  });
}
