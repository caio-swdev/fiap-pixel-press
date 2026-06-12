import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useMinhaBiblioteca,
  useUpdateBiblioteca,
  useRemoveBiblioteca,
} from '../hooks/biblioteca';
import { Button } from '../components/ui/Button';
import { StatusBadge, STATUS_ROTULO } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Select, Label } from '../components/ui/Field';
import { CenteredLoading, EmptyState, ErrorState } from '../components/ui/States';
import { Pagination } from '../components/ui/Pagination';
import type { ItemBiblioteca, StatusBiblioteca } from '../api/types';

const STATUS_OPCOES: StatusBiblioteca[] = [
  'QUERO_JOGAR',
  'JOGANDO',
  'ZERADO',
  'PLATINADO',
  'DROPEI',
];
const PAGE_SIZE = 24;

export function LibraryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useMinhaBiblioteca(page);
  const [emEdicao, setEmEdicao] = useState<ItemBiblioteca | null>(null);
  const [paraRemover, setParaRemover] = useState<ItemBiblioteca | null>(null);
  const remover = useRemoveBiblioteca();

  return (
    <div className="space-y-8">
      <header>
        <p className="label-mono mb-2">Coleção pessoal</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Minha biblioteca</h1>
        <p className="mt-1.5 text-sm text-muted">
          Tudo que você acompanha. Edite status e horas, ou remova.
        </p>
      </header>

      {isLoading ? (
        <CenteredLoading rotulo="Carregando biblioteca" />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data || data.results.length === 0 ? (
        <EmptyState
          titulo="Sua biblioteca está vazia"
          descricao="Encontre jogos no catálogo e adicione-os a partir da tela de detalhe."
          acao={
            <Link to="/catalogo">
              <Button>Explorar catálogo</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-3">
            {data.results.map((item) => (
              <div
                key={item.id}
                className="surface-card flex items-center gap-4 p-3 transition-colors hover:border-line/80"
              >
                <Link to={`/jogo/${item.jogo.slug}`} className="shrink-0">
                  {item.jogo.capaUrl ? (
                    <img
                      src={item.jogo.capaUrl}
                      alt={item.jogo.nome}
                      className="h-20 w-14 rounded-md border border-line object-cover"
                    />
                  ) : (
                    <div className="grid h-20 w-14 place-items-center rounded-md border border-line bg-surface-2 font-mono text-[9px] text-muted-2">
                      s/ capa
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/jogo/${item.jogo.slug}`}
                    className="font-display font-semibold text-fg transition-colors hover:text-accent"
                  >
                    {item.jogo.nome}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.status} />
                    <span className="font-mono text-[10px] text-muted-2">
                      {item.horasJogadas}h jogadas
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variante="subtle" tamanho="sm" onClick={() => setEmEdicao(item)}>
                    Editar
                  </Button>
                  <Button variante="danger" tamanho="sm" onClick={() => setParaRemover(item)}>
                    Remover
                  </Button>
                </div>
              </div>
            ))}
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

      {emEdicao && <EditModal item={emEdicao} onClose={() => setEmEdicao(null)} />}

      {paraRemover && (
        <Modal
          aberto
          titulo="Remover da biblioteca"
          descricao={paraRemover.jogo.nome}
          onClose={() => setParaRemover(null)}
          footer={
            <>
              <Button variante="ghost" onClick={() => setParaRemover(null)}>
                Cancelar
              </Button>
              <Button
                variante="danger"
                carregando={remover.isPending}
                onClick={() =>
                  remover.mutate(paraRemover.id, { onSuccess: () => setParaRemover(null) })
                }
              >
                Remover
              </Button>
            </>
          }
        >
          <p className="text-sm text-muted">Remover este jogo da sua biblioteca?</p>
        </Modal>
      )}
    </div>
  );
}

const editSchema = z.object({
  status: z.enum(['JOGANDO', 'ZERADO', 'QUERO_JOGAR', 'DROPEI', 'PLATINADO']),
  horasJogadas: z.coerce.number().int().min(0),
});
type EditForm = z.infer<typeof editSchema>;

function EditModal({ item, onClose }: { item: ItemBiblioteca; onClose: () => void }) {
  const atualizar = useUpdateBiblioteca();
  const { register, handleSubmit } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { status: item.status, horasJogadas: item.horasJogadas },
  });

  return (
    <Modal
      aberto
      titulo="Editar item"
      descricao={item.jogo.nome}
      onClose={onClose}
      footer={
        <>
          <Button variante="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="form-edit-bib" type="submit" carregando={atualizar.isPending}>
            Salvar
          </Button>
        </>
      }
    >
      <form
        id="form-edit-bib"
        onSubmit={handleSubmit((v) =>
          atualizar.mutate(
            { id: item.id, payload: { status: v.status, horasJogadas: v.horasJogadas } },
            { onSuccess: onClose },
          ),
        )}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="edit-status">Status</Label>
          <Select id="edit-status" {...register('status')}>
            {STATUS_OPCOES.map((s) => (
              <option key={s} value={s}>
                {STATUS_ROTULO[s]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="edit-horas">Horas jogadas</Label>
          <Input id="edit-horas" type="number" min={0} {...register('horasJogadas')} />
        </div>
      </form>
    </Modal>
  );
}
