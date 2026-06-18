import { useEffect, useState } from 'react';
import { warmupBus } from '../../lib/warmup-bus';

/**
 * Aviso de cold start (Render free): aparece quando uma chamada à API passa do
 * limiar de latência (servidor hibernado acordando, ~50s). Some sozinho assim
 * que a resposta chega. Não bloqueia a tela de forma rígida, mas é visível o
 * suficiente para o usuário entender que o clique foi registrado.
 */
export function WarmupOverlay() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => warmupBus.subscribe(setVisivel), []);

  if (!visivel) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[110] flex justify-center p-4"
    >
      <div className="pointer-events-auto flex max-w-md items-center gap-3 rounded-xl border border-info/50 bg-surface px-4 py-3 shadow-card backdrop-blur-md animate-scale-in">
        <svg
          className="h-5 w-5 shrink-0 animate-spin text-info"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg">Acordando o servidor…</p>
          <p className="mt-0.5 text-xs text-muted">
            O ambiente gratuito hiberna após algum tempo ocioso. A primeira resposta pode levar até
            ~50s. Já estamos processando seu pedido.
          </p>
        </div>
      </div>
    </div>
  );
}
