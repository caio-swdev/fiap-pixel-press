import { useEffect, useState } from 'react';
import { useGames, CATALOG_PAGE_SIZE } from '../hooks/catalog';
import { GameCard } from '../components/GameCard';
import { Input } from '../components/ui/Field';
import { Pagination } from '../components/ui/Pagination';
import { CenteredLoading, EmptyState, ErrorState, GridSkeleton } from '../components/ui/States';

export function CatalogPage() {
  const [busca, setBusca] = useState('');
  const [buscaDebounce, setBuscaDebounce] = useState('');
  const [page, setPage] = useState(1);

  // Debounce da busca: evita uma chamada por tecla.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setBuscaDebounce(busca.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(t);
  }, [busca]);

  const { data, isLoading, isError, isFetching, refetch } = useGames(buscaDebounce, page);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label-mono mb-2">Catálogo RAWG</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Explorar jogos</h1>
          <p className="mt-1.5 text-sm text-muted">
            Busca paginada no catálogo real. Abra um card para o detalhe completo.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar (ex.: witcher)"
            className="pl-10"
            aria-label="Buscar jogos"
          />
          {isFetching && !isLoading && (
            <span className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-muted/40 border-t-accent" />
          )}
        </div>
      </header>

      {isLoading ? (
        <GridSkeleton quantidade={CATALOG_PAGE_SIZE} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data || data.results.length === 0 ? (
        <EmptyState
          titulo="Nenhum jogo encontrado"
          descricao={
            buscaDebounce
              ? `Sua busca por "${buscaDebounce}" não retornou resultados.`
              : 'Tente buscar pelo nome de um jogo.'
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.results.map((jogo, i) => (
              <GameCard key={jogo.slug} jogo={jogo} indice={i} />
            ))}
          </div>
          <Pagination
            page={page}
            count={data.count}
            pageSize={CATALOG_PAGE_SIZE}
            temProxima={data.next !== null}
            temAnterior={data.previous !== null}
            onChange={setPage}
          />
        </>
      )}

      {isFetching && isLoading && <CenteredLoading />}
    </div>
  );
}
