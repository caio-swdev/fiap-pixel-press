import { Button } from './Button';

interface PaginationProps {
  page: number;
  count: number;
  pageSize: number;
  temProxima: boolean;
  temAnterior: boolean;
  onChange: (page: number) => void;
}

/** Paginação fiel ao envelope { count, next, previous }. */
export function Pagination({
  page,
  count,
  pageSize,
  temProxima,
  temAnterior,
  onChange,
}: PaginationProps) {
  const totalPaginas = Math.max(1, Math.ceil(count / pageSize));
  if (count === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4 pt-2">
      <p className="label-mono">
        Página <span className="text-fg">{page}</span> de {totalPaginas}
        <span className="ml-2 text-muted-2">· {count} no total</span>
      </p>
      <div className="flex gap-2">
        <Button
          variante="subtle"
          tamanho="sm"
          disabled={!temAnterior}
          onClick={() => onChange(page - 1)}
        >
          ← Anterior
        </Button>
        <Button
          variante="subtle"
          tamanho="sm"
          disabled={!temProxima}
          onClick={() => onChange(page + 1)}
        >
          Próxima →
        </Button>
      </div>
    </div>
  );
}
