import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Variante = 'primary' | 'ghost' | 'outline' | 'danger' | 'subtle';
type Tamanho = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanho?: Tamanho;
  carregando?: boolean;
}

const VARIANTES: Record<Variante, string> = {
  primary:
    'bg-accent text-accent-ink font-semibold hover:bg-accent-dim shadow-glow-soft hover:shadow-glow',
  outline: 'border border-line text-fg hover:border-accent/60 hover:text-accent bg-transparent',
  ghost: 'text-muted hover:text-fg hover:bg-surface-2',
  subtle: 'bg-surface-2 text-fg hover:bg-surface-3 border border-line',
  danger: 'bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25',
};

const TAMANHOS: Record<Tamanho, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-9 w-9',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variante = 'primary', tamanho = 'md', carregando, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || carregando}
      className={cn(
        'focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTES[variante],
        TAMANHOS[tamanho],
        className,
      )}
      {...rest}
    >
      {carregando && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});
