import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/endpoints';
import { toastBus } from '../lib/toast-bus';
import type { Papel } from '../api/types';

export function useUsuarios(page: number) {
  return useQuery({
    queryKey: ['usuarios', page],
    queryFn: () => api.listarUsuarios({ page, page_size: 20 }),
  });
}

export function useAtribuirPapel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, papel }: { id: string; papel: Papel }) => api.atribuirPapel(id, papel),
    onSuccess: (usuario) => {
      void qc.invalidateQueries({ queryKey: ['usuarios'] });
      toastBus.sucesso('Papel atualizado', `${usuario.nome} agora é ${usuario.papel}`);
    },
  });
}
