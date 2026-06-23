import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAddBiblioteca } from '../../hooks/biblioteca';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Label } from '../../components/ui/Field';
import { STATUS_ROTULO } from '../../components/ui/Badge';
import type { StatusBiblioteca } from '../../api/types';

// Fonte única dos status: o schema do form deriva desta lista (evita a lista
// duplicada e fora de ordem que existia entre STATUS_OPCOES e o z.enum).
const STATUS_OPCOES = [
  'QUERO_JOGAR',
  'JOGANDO',
  'ZERADO',
  'PLATINADO',
  'DROPEI',
] as const satisfies readonly StatusBiblioteca[];

const bibliotecaSchema = z.object({
  status: z.enum(STATUS_OPCOES),
  horasJogadas: z.coerce.number().int().min(0).optional(),
});
type BibliotecaForm = z.infer<typeof bibliotecaSchema>;

export function AddBibliotecaModal({
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
