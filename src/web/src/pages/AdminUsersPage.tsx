import { useState } from 'react';
import { useUsuarios, useAtribuirPapel } from '../hooks/usuarios';
import { useSession } from '../auth/session';
import { RoleBadge, Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Field';
import { CenteredLoading, ErrorState, EmptyState } from '../components/ui/States';
import { Pagination } from '../components/ui/Pagination';
import type { Papel } from '../api/types';

const PAGE_SIZE = 20;
const PAPEIS: Papel[] = ['USUARIO', 'MODERADOR', 'ADMIN'];

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { usuario: atual } = useSession();
  const { data, isLoading, isError, refetch } = useUsuarios(page);
  const atribuir = useAtribuirPapel();

  return (
    <div className="space-y-8">
      <header>
        <p className="label-mono mb-2">Administração</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Usuários</h1>
        <p className="mt-1.5 text-sm text-muted">
          Atribua papéis. Apenas Admin acessa esta tela; o backend é a autoridade final.
        </p>
      </header>

      {isLoading ? (
        <CenteredLoading rotulo="Carregando usuários" />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data || data.results.length === 0 ? (
        <EmptyState titulo="Nenhum usuário" />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2/60 text-left">
                  <th className="px-4 py-3 label-mono font-normal">Usuário</th>
                  <th className="hidden px-4 py-3 label-mono font-normal sm:table-cell">Status</th>
                  <th className="px-4 py-3 label-mono font-normal">Papel atual</th>
                  <th className="px-4 py-3 label-mono font-normal">Alterar papel</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((u) => {
                  const ehEu = u.id === atual?.id;
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-line last:border-0 transition-colors hover:bg-surface-2/30"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-fg">
                          {u.nome}
                          {ehEu && <span className="ml-2 font-mono text-[10px] text-accent">você</span>}
                        </p>
                        <p className="font-mono text-[10px] text-muted-2">{u.email}</p>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        {u.ativo ? (
                          <Badge className="border-accent/40 bg-accent/10 text-accent">ativo</Badge>
                        ) : (
                          <Badge className="border-danger/40 bg-danger/10 text-danger">inativo</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge papel={u.papel} />
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={u.papel}
                          disabled={ehEu || atribuir.isPending}
                          title={ehEu ? 'Você não pode alterar o próprio papel' : undefined}
                          onChange={(e) =>
                            atribuir.mutate({ id: u.id, papel: e.target.value as Papel })
                          }
                          className="h-9 max-w-[170px] text-xs"
                        >
                          {PAPEIS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            count={data.count}
            pageSize={PAGE_SIZE}
            temProxima={data.next !== null}
            temAnterior={data.previous !== null}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
