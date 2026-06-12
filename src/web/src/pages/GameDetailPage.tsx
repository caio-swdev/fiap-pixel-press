import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGameDetail } from '../hooks/catalog';
import { useReviews, useCreateReview, useEditReview, useDeleteReview } from '../hooks/reviews';
import { useAddBiblioteca } from '../hooks/biblioteca';
import { useReport, useHideReview } from '../hooks/moderation';
import { temPapel, useSession } from '../auth/session';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Select, Label, FieldError } from '../components/ui/Field';
import { CenteredLoading, EmptyState, ErrorState } from '../components/ui/States';
import { ReviewCard } from '../components/ReviewCard';
import { STATUS_ROTULO } from '../components/ui/Badge';
import type { Review, StatusBiblioteca } from '../api/types';

const STATUS_OPCOES: StatusBiblioteca[] = [
  'QUERO_JOGAR',
  'JOGANDO',
  'ZERADO',
  'PLATINADO',
  'DROPEI',
];

export function GameDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { usuario } = useSession();
  const { data: jogo, isLoading, isError, refetch } = useGameDetail(slug);
  const { data: reviewsPag, isLoading: carregandoReviews } = useReviews(slug, 1);

  const [modalBiblioteca, setModalBiblioteca] = useState(false);
  const [reviewEmEdicao, setReviewEmEdicao] = useState<Review | null>(null);
  const [modalReview, setModalReview] = useState(false);
  const [reviewParaDenunciar, setReviewParaDenunciar] = useState<Review | null>(null);
  const [reviewParaOcultar, setReviewParaOcultar] = useState<Review | null>(null);
  const [reviewParaExcluir, setReviewParaExcluir] = useState<Review | null>(null);

  const deleteReview = useDeleteReview();

  if (isLoading) return <CenteredLoading rotulo="Carregando jogo" />;
  if (isError || !jogo) return <ErrorState onRetry={() => void refetch()} />;

  const reviews = reviewsPag?.results ?? [];
  const minhaReview = usuario ? reviews.find((r) => r.usuario.id === usuario.id) : undefined;
  const podeModerar = temPapel(usuario?.papel, 'MODERADOR');

  function abrirNovaReview() {
    setReviewEmEdicao(minhaReview ?? null);
    setModalReview(true);
  }

  return (
    <div className="space-y-10">
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent"
      >
        ← voltar ao catálogo
      </Link>

      {/* Hero */}
      <section className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-line bg-surface-2 shadow-card">
            {jogo.capaUrl ? (
              <img src={jogo.capaUrl} alt={jogo.nome} className="aspect-[3/4] w-full object-cover" />
            ) : (
              <div className="grid aspect-[3/4] place-items-center font-mono text-xs text-muted-2">
                sem capa
              </div>
            )}
          </div>
          {usuario ? (
            <Button className="w-full" tamanho="lg" onClick={() => setModalBiblioteca(true)}>
              + Adicionar à biblioteca
            </Button>
          ) : (
            <p className="text-center font-mono text-[10px] text-muted-2">
              entre para gerenciar biblioteca
            </p>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {jogo.metacritic !== null && (
              <Badge className="border-accent/40 bg-accent/10 text-accent">
                metacritic {jogo.metacritic}
              </Badge>
            )}
            {jogo.rating !== null && (
              <Badge className="border-line bg-surface-2 text-muted">★ {jogo.rating.toFixed(2)}</Badge>
            )}
            {jogo.lancamento && (
              <Badge className="border-line bg-surface-2 text-muted">{jogo.lancamento}</Badge>
            )}
          </div>

          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight">
            {jogo.nome}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-2">{jogo.slug}</p>

          {jogo.descricao && (
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">{jogo.descricao}</p>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {jogo.generos.length > 0 && (
              <div>
                <p className="label-mono mb-2">Gêneros</p>
                <div className="flex flex-wrap gap-1.5">
                  {jogo.generos.map((g) => (
                    <Badge key={g} className="border-line bg-surface-2 text-muted">
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {jogo.plataformas.length > 0 && (
              <div>
                <p className="label-mono mb-2">Plataformas</p>
                <div className="flex flex-wrap gap-1.5">
                  {jogo.plataformas.map((p) => (
                    <Badge key={p} className="border-line bg-surface-2 text-muted">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Screenshots */}
      {jogo.screenshots.length > 0 && (
        <section>
          <p className="label-mono mb-3">Screenshots</p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {jogo.screenshots.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${jogo.nome} screenshot ${i + 1}`}
                loading="lazy"
                className="h-44 w-72 shrink-0 rounded-lg border border-line object-cover"
              />
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="label-mono mb-1">Comunidade</p>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Reviews
              <span className="ml-2 font-mono text-sm font-normal text-muted-2">
                {reviewsPag?.count ?? 0}
              </span>
            </h2>
          </div>
          {usuario && (
            <Button variante={minhaReview ? 'outline' : 'primary'} onClick={abrirNovaReview}>
              {minhaReview ? 'Editar minha review' : 'Escrever review'}
            </Button>
          )}
        </div>

        {carregandoReviews ? (
          <CenteredLoading rotulo="Carregando reviews" />
        ) : reviews.length === 0 ? (
          <EmptyState
            titulo="Sem reviews ainda"
            descricao={usuario ? 'Seja o primeiro a avaliar este jogo.' : 'Entre para avaliar este jogo.'}
          />
        ) : (
          <div className="grid gap-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                ehDono={usuario?.id === review.usuario.id}
                podeModerar={podeModerar}
                podeDenunciar={Boolean(usuario)}
                onEdit={(r) => {
                  setReviewEmEdicao(r);
                  setModalReview(true);
                }}
                onDelete={(r) => setReviewParaExcluir(r)}
                onReport={(r) => setReviewParaDenunciar(r)}
                onHide={(r) => setReviewParaOcultar(r)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modais */}
      {modalBiblioteca && (
        <AddBibliotecaModal slug={slug} nome={jogo.nome} onClose={() => setModalBiblioteca(false)} />
      )}
      {modalReview && (
        <ReviewFormModal
          slug={slug}
          review={reviewEmEdicao}
          onClose={() => {
            setModalReview(false);
            setReviewEmEdicao(null);
          }}
        />
      )}
      {reviewParaDenunciar && (
        <ReportModal review={reviewParaDenunciar} onClose={() => setReviewParaDenunciar(null)} />
      )}
      {reviewParaOcultar && (
        <HideModal review={reviewParaOcultar} onClose={() => setReviewParaOcultar(null)} />
      )}
      {reviewParaExcluir && (
        <Modal
          aberto
          titulo="Excluir review"
          descricao="Esta ação é definitiva."
          onClose={() => setReviewParaExcluir(null)}
          footer={
            <>
              <Button variante="ghost" onClick={() => setReviewParaExcluir(null)}>
                Cancelar
              </Button>
              <Button
                variante="danger"
                carregando={deleteReview.isPending}
                onClick={() =>
                  deleteReview.mutate(reviewParaExcluir.id, {
                    onSuccess: () => setReviewParaExcluir(null),
                  })
                }
              >
                Excluir
              </Button>
            </>
          }
        >
          <p className="text-sm text-muted">
            Tem certeza que deseja excluir sua review deste jogo?
          </p>
        </Modal>
      )}
    </div>
  );
}

// ---- Modal: adicionar à biblioteca ----
const bibliotecaSchema = z.object({
  status: z.enum(['JOGANDO', 'ZERADO', 'QUERO_JOGAR', 'DROPEI', 'PLATINADO']),
  horasJogadas: z.coerce.number().int().min(0).optional(),
});
type BibliotecaForm = z.infer<typeof bibliotecaSchema>;

function AddBibliotecaModal({
  slug,
  nome,
  onClose,
}: {
  slug: string;
  nome: string;
  onClose: () => void;
}) {
  const add = useAddBiblioteca();
  const { register, handleSubmit } = useForm<BibliotecaForm>({
    resolver: zodResolver(bibliotecaSchema),
    defaultValues: { status: 'QUERO_JOGAR', horasJogadas: 0 },
  });

  function onSubmit(valores: BibliotecaForm) {
    add.mutate(
      { jogoSlug: slug, status: valores.status, horasJogadas: valores.horasJogadas },
      { onSuccess: onClose },
    );
  }

  return (
    <Modal
      aberto
      titulo="Adicionar à biblioteca"
      descricao={nome}
      onClose={onClose}
      footer={
        <>
          <Button variante="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="form-biblioteca" type="submit" carregando={add.isPending}>
            Adicionar
          </Button>
        </>
      }
    >
      <form id="form-biblioteca" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register('status')}>
            {STATUS_OPCOES.map((s) => (
              <option key={s} value={s}>
                {STATUS_ROTULO[s]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="horas">Horas jogadas</Label>
          <Input id="horas" type="number" min={0} {...register('horasJogadas')} />
        </div>
      </form>
    </Modal>
  );
}

// ---- Modal: criar/editar review ----
// Mirror das regras (nota 0..10) sem substituir o backend: o limite superior NÃO é
// travado no client, para que nota inválida (ex.: 11) chegue ao backend e retorne 422.
const reviewSchema = z.object({
  nota: z.coerce.number().int('A nota deve ser um inteiro.').min(0, 'Mínimo 0.'),
  texto: z.string().max(5000).optional(),
  spoiler: z.boolean(),
});
type ReviewForm = z.infer<typeof reviewSchema>;

function ReviewFormModal({
  slug,
  review,
  onClose,
}: {
  slug: string;
  review: Review | null;
  onClose: () => void;
}) {
  const criar = useCreateReview();
  const editar = useEditReview();
  const editando = Boolean(review);

  const { register, handleSubmit, formState } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      nota: review?.nota ?? 8,
      texto: review?.texto ?? '',
      spoiler: review?.spoiler ?? false,
    },
  });

  function onSubmit(valores: ReviewForm) {
    const payload = {
      nota: valores.nota,
      texto: valores.texto?.trim() ? valores.texto.trim() : undefined,
      spoiler: valores.spoiler,
    };
    if (editando && review) {
      editar.mutate({ id: review.id, payload }, { onSuccess: onClose });
    } else {
      criar.mutate({ jogoSlug: slug, ...payload }, { onSuccess: onClose });
    }
  }

  const pendente = criar.isPending || editar.isPending;

  return (
    <Modal
      aberto
      titulo={editando ? 'Editar review' : 'Escrever review'}
      descricao="Nota de 0 a 10. O backend valida a faixa (422 se inválida)."
      onClose={onClose}
      footer={
        <>
          <Button variante="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="form-review" type="submit" carregando={pendente}>
            {editando ? 'Salvar' : 'Publicar'}
          </Button>
        </>
      }
    >
      <form id="form-review" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="nota">Nota (0 a 10)</Label>
          {/* Sem max nativo de propósito: a faixa é regra de negócio do backend.
              Travar com max=10 no HTML bloquearia o submit e impediria o 422. */}
          <Input id="nota" type="number" {...register('nota')} />
          <FieldError>{formState.errors.nota?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="texto">Texto (opcional)</Label>
          <Textarea id="texto" placeholder="O que você achou?" {...register('texto')} />
          <FieldError>{formState.errors.texto?.message}</FieldError>
        </div>
        <label className="flex items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            className="h-4 w-4 accent-accent"
            {...register('spoiler')}
          />
          Contém spoiler
        </label>
      </form>
    </Modal>
  );
}

// ---- Modal: denunciar ----
const motivoSchema = z.object({
  motivo: z.string().min(3, 'Descreva o motivo (mín. 3 caracteres).').max(500),
});
type MotivoForm = z.infer<typeof motivoSchema>;

function ReportModal({ review, onClose }: { review: Review; onClose: () => void }) {
  const report = useReport();
  const { register, handleSubmit, formState } = useForm<MotivoForm>({
    resolver: zodResolver(motivoSchema),
    defaultValues: { motivo: '' },
  });

  return (
    <Modal
      aberto
      titulo="Denunciar review"
      descricao={`Review de ${review.usuario.nome}`}
      onClose={onClose}
      footer={
        <>
          <Button variante="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="form-report" type="submit" variante="danger" carregando={report.isPending}>
            Enviar denúncia
          </Button>
        </>
      }
    >
      <form
        id="form-report"
        onSubmit={handleSubmit((v) =>
          report.mutate({ reviewId: review.id, motivo: v.motivo }, { onSuccess: onClose }),
        )}
      >
        <Label htmlFor="motivo-report">Motivo</Label>
        <Textarea id="motivo-report" placeholder="Por que esta review fere as diretrizes?" {...register('motivo')} />
        <FieldError>{formState.errors.motivo?.message}</FieldError>
      </form>
    </Modal>
  );
}

// ---- Modal: ocultar (moderação) ----
function HideModal({ review, onClose }: { review: Review; onClose: () => void }) {
  const hide = useHideReview();
  const { register, handleSubmit, formState } = useForm<MotivoForm>({
    resolver: zodResolver(motivoSchema),
    defaultValues: { motivo: '' },
  });

  return (
    <Modal
      aberto
      titulo="Ocultar review"
      descricao="Soft-delete de moderação: a review some das listagens públicas."
      onClose={onClose}
      footer={
        <>
          <Button variante="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button form="form-hide" type="submit" variante="outline" carregando={hide.isPending}>
            Ocultar
          </Button>
        </>
      }
    >
      <form
        id="form-hide"
        onSubmit={handleSubmit((v) =>
          hide.mutate({ id: review.id, motivo: v.motivo }, { onSuccess: onClose }),
        )}
      >
        <Label htmlFor="motivo-hide">Motivo da ocultação</Label>
        <Textarea id="motivo-hide" placeholder="Registro de moderação (visível na auditoria)." {...register('motivo')} />
        <FieldError>{formState.errors.motivo?.message}</FieldError>
      </form>
    </Modal>
  );
}
