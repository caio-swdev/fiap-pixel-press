import { Link } from 'react-router-dom';
import type { JogoResumo } from '../api/types';

/** Card de catálogo: capa, nome, slug. Burro: só apresenta e linka. */
export function GameCard({ jogo, indice = 0 }: { jogo: JogoResumo; indice?: number }) {
  return (
    <Link
      to={`/jogo/${jogo.slug}`}
      style={{ animationDelay: `${Math.min(indice, 11) * 40}ms` }}
      className="corner-tick group animate-fade-up overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-accent/50 hover:shadow-glow-soft focus-ring"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-2">
        {jogo.capaUrl ? (
          <img
            src={jogo.capaUrl}
            alt={jogo.nome}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs text-muted-2">
            sem capa
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent opacity-80" />
        <span className="absolute left-2.5 top-2.5 font-mono text-[10px] uppercase tracking-widest text-accent/0 transition-colors group-hover:text-accent">
          ▸ abrir
        </span>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-fg transition-colors group-hover:text-accent">
          {jogo.nome}
        </h3>
        <p className="mt-1 truncate font-mono text-[10px] text-muted-2">{jogo.slug}</p>
      </div>
    </Link>
  );
}
