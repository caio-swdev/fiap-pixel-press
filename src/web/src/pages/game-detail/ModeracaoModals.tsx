import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useReport, useHideReview } from '../../hooks/moderation';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea, Label, FieldError } from '../../components/ui/Field';
import type { Review } from '../../api/types';

const motivoSchema = z.object({
  motivo: z.string().min(3, 'Descreva o motivo (mín. 3 caracteres).').max(500),
});
type MotivoForm = z.infer<typeof motivoSchema>;

// ---- Modal: denunciar ----
export function ReportModal({ review, onClose }: { review: Review; onClose: () => void }) {
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
export function HideModal({ review, onClose }: { review: Review; onClose: () => void }) {
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
