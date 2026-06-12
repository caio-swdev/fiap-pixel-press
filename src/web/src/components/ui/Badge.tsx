import { cn } from '../../lib/cn';
import type { Papel, StatusBiblioteca } from '../../api/types';

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
        className,
      )}
    >
      {children}
    </span>
  );
}

const PAPEL_ESTILO: Record<Papel, string> = {
  USUARIO: 'border-line text-muted bg-surface-2',
  MODERADOR: 'border-info/40 text-info bg-info/10',
  ADMIN: 'border-accent/50 text-accent bg-accent/10',
};

export function RoleBadge({ papel }: { papel: Papel }) {
  return <Badge className={PAPEL_ESTILO[papel]}>{papel}</Badge>;
}

const STATUS_ROTULO: Record<StatusBiblioteca, string> = {
  JOGANDO: 'Jogando',
  ZERADO: 'Zerado',
  QUERO_JOGAR: 'Quero jogar',
  DROPEI: 'Dropei',
  PLATINADO: 'Platinado',
};

const STATUS_ESTILO: Record<StatusBiblioteca, string> = {
  JOGANDO: 'border-info/40 text-info bg-info/10',
  ZERADO: 'border-accent/40 text-accent bg-accent/10',
  QUERO_JOGAR: 'border-warn/40 text-warn bg-warn/10',
  DROPEI: 'border-danger/40 text-danger bg-danger/10',
  PLATINADO: 'border-[#c9a3ff]/50 text-[#c9a3ff] bg-[#c9a3ff]/10',
};

export function StatusBadge({ status }: { status: StatusBiblioteca }) {
  return <Badge className={STATUS_ESTILO[status]}>{STATUS_ROTULO[status]}</Badge>;
}

export { STATUS_ROTULO };
