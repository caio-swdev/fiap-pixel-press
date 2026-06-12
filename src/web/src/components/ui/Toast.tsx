import { useEffect, useState } from 'react';
import { toastBus, type ToastEntrada } from '../../lib/toast-bus';
import { cn } from '../../lib/cn';

const ESTILO = {
  erro: 'border-danger/50 bg-danger/10',
  sucesso: 'border-accent/50 bg-accent/10',
  info: 'border-info/50 bg-info/10',
} as const;

const ICONE = {
  erro: 'M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  sucesso: 'M20 6 9 17l-5-5',
  info: 'M12 16v-4m0-4h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z',
} as const;

const COR_ICONE = { erro: 'text-danger', sucesso: 'text-accent', info: 'text-info' } as const;

/** Viewport global de toasts. Inscreve-se no toastBus (disparado pelo interceptor). */
export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastEntrada[]>([]);

  useEffect(
    () =>
      toastBus.subscribe((toast) => {
        setToasts((atual) => [...atual, toast]);
        const ttl = toast.tipo === 'erro' ? 6500 : 3800;
        window.setTimeout(() => {
          setToasts((atual) => atual.filter((t) => t.id !== toast.id));
        }, ttl);
      }),
    [],
  );

  function descartar(id: number) {
    setToasts((atual) => atual.filter((t) => t.id !== id));
  }

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2.5 p-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto animate-scale-in overflow-hidden rounded-xl border bg-surface px-4 py-3 shadow-card backdrop-blur-md',
            ESTILO[t.tipo],
          )}
          role={t.tipo === 'erro' ? 'alert' : 'status'}
        >
          <div className="flex gap-3">
            <svg
              className={cn('mt-0.5 h-5 w-5 shrink-0', COR_ICONE[t.tipo])}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={ICONE[t.tipo]} />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-fg">{t.titulo}</p>
              {t.descricao && <p className="mt-0.5 text-xs text-muted">{t.descricao}</p>}
              {t.detalhes && t.detalhes.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {t.detalhes.slice(0, 4).map((d, i) => (
                    <li key={i} className="text-xs text-muted-2">
                      • {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={() => descartar(t.id)}
              className="-mr-1 -mt-0.5 h-6 w-6 shrink-0 text-muted transition-colors hover:text-fg"
              aria-label="Fechar aviso"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
