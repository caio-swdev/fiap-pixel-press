/**
 * Pub/sub mínimo para toasts, desacoplado da árvore React.
 * Permite que o interceptor do axios (fora de componentes) dispare toasts
 * que o <ToastViewport> renderiza. Tratamento central do envelope de erro.
 */

export type ToastTipo = 'erro' | 'sucesso' | 'info';

export interface ToastEntrada {
  id: number;
  tipo: ToastTipo;
  titulo: string;
  descricao?: string;
  detalhes?: string[];
}

type Listener = (toast: ToastEntrada) => void;

let seq = 1;
const listeners = new Set<Listener>();

function emitir(tipo: ToastTipo, titulo: string, descricao?: string, detalhes?: string[]): void {
  const toast: ToastEntrada = { id: seq++, tipo, titulo, descricao, detalhes };
  listeners.forEach((l) => l(toast));
}

export const toastBus = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  erro(titulo: string, descricao?: string, detalhes?: string[]): void {
    emitir('erro', titulo, descricao, detalhes);
  },
  sucesso(titulo: string, descricao?: string): void {
    emitir('sucesso', titulo, descricao);
  },
  info(titulo: string, descricao?: string): void {
    emitir('info', titulo, descricao);
  },
};
