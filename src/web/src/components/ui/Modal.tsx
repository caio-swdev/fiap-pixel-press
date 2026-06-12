import { useEffect, type ReactNode } from 'react';
import { Button } from './Button';

interface ModalProps {
  aberto: boolean;
  titulo: string;
  descricao?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/** Modal acessível leve: Escape fecha, clique no backdrop fecha, scroll travado. */
export function Modal({ aberto, titulo, descricao, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [aberto, onClose]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/80 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div className="w-full max-w-lg animate-scale-in overflow-hidden rounded-t-2xl border border-line bg-surface shadow-card sm:rounded-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-fg">{titulo}</h2>
            {descricao && <p className="mt-1 text-sm text-muted">{descricao}</p>}
          </div>
          <Button variante="ghost" tamanho="icon" onClick={onClose} aria-label="Fechar">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </Button>
        </header>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <footer className="flex justify-end gap-3 border-t border-line bg-surface-2/40 px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
