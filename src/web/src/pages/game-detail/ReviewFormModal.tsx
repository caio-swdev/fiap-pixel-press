import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateReview, useEditReview } from '../../hooks/reviews';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea, Label, FieldError } from '../../components/ui/Field';
import type { Review } from '../../api/types';

// Mirror das regras (nota 0..10) sem substituir o backend: o limite superior NÃO é
// travado no client, para que nota inválida (ex.: 11) chegue ao backend e retorne 422.
const reviewSchema = z.object({
  nota: z.coerce.number().int('A nota deve ser um inteiro.').min(0, 'Mínimo 0.'),
  texto: z.string().max(5000).optional(),
  spoiler: z.boolean(),
});
type ReviewForm = z.infer<typeof reviewSchema>;

export function ReviewFormModal({
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
