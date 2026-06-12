import { cn } from '../../lib/cn';
import { Button } from './Button';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-muted/40 border-t-accent',
        className,
      )}
    />
  );
}

export function CenteredLoading({ rotulo = 'Carregando' }: { rotulo?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted">
      <Spinner className="h-7 w-7" />
      <span className="label-mono">{rotulo}…</span>
    </div>
  );
}

export function GridSkeleton({ quantidade = 12 }: { quantidade?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: quantidade }).map((_, i) => (
        <div key={i} className="surface-card overflow-hidden">
          <div className="skeleton aspect-[3/4] w-full" />
          <div className="space-y-2 p-3">
            <div className="skeleton h-3 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  titulo,
  descricao,
  icone,
  acao,
}: {
  titulo: string;
  descricao?: string;
  icone?: React.ReactNode;
  acao?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-16 text-center">
      {icone && <div className="mb-4 text-muted-2">{icone}</div>}
      <h3 className="font-display text-base font-bold text-fg">{titulo}</h3>
      {descricao && <p className="mt-1 max-w-sm text-sm text-muted">{descricao}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      titulo="Algo deu errado"
      descricao="Não foi possível carregar os dados. Verifique se o backend está no ar e tente de novo."
      icone={
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
      acao={
        onRetry && (
          <Button variante="outline" tamanho="sm" onClick={onRetry}>
            Tentar de novo
          </Button>
        )
      }
    />
  );
}
