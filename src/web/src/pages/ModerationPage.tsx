import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useReports, useHideReview } from '../hooks/moderation';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Textarea, Label, FieldError } from '../components/ui/Field';
import { CenteredLoading, EmptyState, ErrorState } from '../components/ui/States';
import { Pagination } from '../components/ui/Pagination';
import type { Denuncia } from '../api/types';

const PAGE_SIZE = 20;

export function ModerationPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useReports(page);
  const [paraOcultar, setParaOcultar] = useState<Denuncia | null>(null);

  return (
    <div className="space-y-8">
      <header>
        <p className="label-mono mb-2">Painel de moderação</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Denúncias pendentes</h1>
        <p className="mt-1.5 text-sm text-muted">
          Analise o conteúdo reportado e oculte quando ferir as diretrizes. Ocultar não apaga: faz
          soft-delete e resolve a denúncia.
        </p>
      </header>

      {isLoading ? (
        <CenteredLoading rotulo="Carregando denúncias" />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data || data.results.length === 0 ? (
        <EmptyState
          titulo="Fila limpa"
          descricao="Nenhuma denúncia pendente no momento."
          icone={
            <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          }
        />
      ) : (
        <>
          <div className="grid gap-4">
            {data.results.map((d) => (
              <article key={d.id} className="surface-card animate-fade-up p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge className="border-warn/40 bg-warn/10 text-warn">pendente</Badge>
                    <span className="font-mono text-[10px] text-muted-2">
                      denunciada por {d.denunciante.nome} ·{' '}
                      {new Date(d.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <Button variante="outline" tamanho="sm" onClick={() => setParaOcultar(d)}>
                    Ocultar review
                  </Button>
                </div>

                <p className="mt-3 rounded-lg border border-danger/20 bg-danger/5 px-3.5 py-2.5 text-sm text-danger/90">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-danger/60">
                    motivo
                  </span>
                  <br />
                  {d.motivo}
                </p>

                <div className="mt-4 rounded-lg border border-line bg-surface-2/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      to={`/jogo/${d.review.jogo.slug}`}
                      className="font-display text-sm font-semibold text-fg transition-colors hover:text-accent"
                    >
                      {d.review.jogo.nome}
                    </Link>
                    <span className="font-mono text-xs text-accent">nota {d.review.nota}</span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-muted-2">
                    review de {d.review.usuario?.nome ?? 'usuário'}
                  </p>
                  {d.review.texto && (
                    <p className="mt-2 text-sm leading-relaxed text-muted">"{d.review.texto}"</p>
                  )}
                </div>
              </article>
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

      {paraOcultar && (
        <HideReportModal denuncia={paraOcultar} onClose={() => setParaOcultar(null)} />
      )}
    </div>
  );
}

const motivoSchema = z.object({
  motivo: z.string().min(3, 'Descreva o motivo (mín. 3 caracteres).').max(500),
});
type MotivoForm = z.infer<typeof motivoSchema>;

function HideReportModal({ denuncia, onClose }: { denuncia: Denuncia; onClose: () => void }) {
  const hide = useHideReview();
  const { register, handleSubmit, formState } = useForm<MotivoForm>({
    resolver: zodResolver(motivoSchema),
    defaultValues: { motivo: denuncia.motivo },
  });

  return (
    <Modal
      aberto
      titulo="Ocultar review denunciada"
      descricao={`${denuncia.review.jogo.nome} · review de ${denuncia.review.usuario?.nome ?? 'usuário'}`}
      onClose={onClose}
      footer={
        <>
          <Button variante="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="form-hide-report" type="submit" variante="outline" carregando={hide.isPending}>
            Confirmar ocultação
          </Button>
        </>
      }
    >
      <form
        id="form-hide-report"
        onSubmit={handleSubmit((v) =>
          hide.mutate(
            { id: denuncia.review.id, motivo: v.motivo },
            { onSuccess: onClose },
          ),
        )}
      >
        <Label htmlFor="motivo-mod">Motivo da ocultação</Label>
        <Textarea id="motivo-mod" {...register('motivo')} />
        <FieldError>{formState.errors.motivo?.message}</FieldError>
        <p className="mt-2 font-mono text-[10px] text-muted-2">
          A review some das listagens públicas e a denúncia passa a RESOLVIDA.
        </p>
      </form>
    </Modal>
  );
}
