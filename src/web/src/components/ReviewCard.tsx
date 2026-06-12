import { useState } from 'react';
import type { Review } from '../api/types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/cn';

interface ReviewCardProps {
  review: Review;
  ehDono: boolean;
  podeModerar: boolean;
  podeDenunciar: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (review: Review) => void;
  onReport?: (review: Review) => void;
  onHide?: (review: Review) => void;
}

function corNota(nota: number): string {
  if (nota >= 8) return 'text-accent border-accent/40 bg-accent/10';
  if (nota >= 5) return 'text-warn border-warn/40 bg-warn/10';
  return 'text-danger border-danger/40 bg-danger/10';
}

export function ReviewCard({
  review,
  ehDono,
  podeModerar,
  podeDenunciar,
  onEdit,
  onDelete,
  onReport,
  onHide,
}: ReviewCardProps) {
  const [spoilerAberto, setSpoilerAberto] = useState(false);
  const escondeTexto = review.spoiler && !spoilerAberto;

  return (
    <article
      className={cn(
        'surface-card animate-fade-up p-5',
        review.oculto && 'border-danger/30 opacity-70',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'grid h-12 w-12 shrink-0 place-items-center rounded-lg border font-display text-lg font-bold tabular-nums',
              corNota(review.nota),
            )}
          >
            {review.nota}
          </span>
          <div>
            <p className="font-semibold text-fg">{review.usuario.nome}</p>
            <p className="font-mono text-[10px] text-muted-2">
              {new Date(review.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
              {ehDono && <span className="ml-2 text-accent">· você</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {review.spoiler && (
            <Badge className="border-warn/40 bg-warn/10 text-warn">spoiler</Badge>
          )}
          {review.oculto && (
            <Badge className="border-danger/40 bg-danger/10 text-danger">oculta</Badge>
          )}
        </div>
      </div>

      {review.texto && (
        <div className="relative mt-4">
          <p
            className={cn(
              'text-sm leading-relaxed text-muted transition',
              escondeTexto && 'select-none blur-sm',
            )}
          >
            {review.texto}
          </p>
          {escondeTexto && (
            <button
              onClick={() => setSpoilerAberto(true)}
              className="absolute inset-0 grid place-items-center text-xs font-semibold text-accent"
            >
              Revelar spoiler
            </button>
          )}
        </div>
      )}

      {review.oculto && review.motivoOcultacao && (
        <p className="mt-3 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-xs text-danger/80">
          Motivo da ocultação: {review.motivoOcultacao}
        </p>
      )}

      {(ehDono || podeModerar || podeDenunciar) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
          {ehDono && onEdit && (
            <Button variante="subtle" tamanho="sm" onClick={() => onEdit(review)}>
              Editar
            </Button>
          )}
          {ehDono && onDelete && (
            <Button variante="danger" tamanho="sm" onClick={() => onDelete(review)}>
              Excluir
            </Button>
          )}
          {!ehDono && podeDenunciar && onReport && (
            <Button variante="ghost" tamanho="sm" onClick={() => onReport(review)}>
              ⚑ Denunciar
            </Button>
          )}
          {podeModerar && !review.oculto && onHide && (
            <Button variante="outline" tamanho="sm" onClick={() => onHide(review)}>
              Ocultar (moderar)
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
