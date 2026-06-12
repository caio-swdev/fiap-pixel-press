import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '../auth/session';
import { ApiError } from '../api/errors';
import { Button } from '../components/ui/Button';
import { Input, Label, FieldError } from '../components/ui/Field';
import { Badge } from '../components/ui/Badge';

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'Informe a senha.'),
});
type FormValores = z.infer<typeof schema>;

interface Atalho {
  papel: string;
  email: string;
  cor: string;
}

const ATALHOS: Atalho[] = [
  { papel: 'Admin', email: 'admin@pixelpress.dev', cor: 'border-accent/50 text-accent bg-accent/10' },
  { papel: 'Moderador', email: 'moderador@pixelpress.dev', cor: 'border-info/40 text-info bg-info/10' },
  { papel: 'Usuário', email: 'usuario@pixelpress.dev', cor: 'border-line text-muted bg-surface-2' },
  { papel: 'Inativo', email: 'inativo@pixelpress.dev', cor: 'border-danger/40 text-danger bg-danger/10' },
];

const SENHA_SEED = 'Senha@123';

export function LoginPage() {
  const { autenticado, entrar } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [erro, setErro] = useState<string | null>(null);

  const destino = (location.state as { from?: string } | null)?.from ?? '/catalogo';

  const { register, handleSubmit, setValue, formState } = useForm<FormValores>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', senha: '' },
  });

  if (autenticado) return <Navigate to={destino} replace />;

  async function onSubmit(valores: FormValores) {
    setErro(null);
    try {
      await entrar(valores);
      navigate(destino, { replace: true });
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível entrar.');
    }
  }

  function preencher(email: string) {
    setValue('email', email, { shouldValidate: true });
    setValue('senha', SENHA_SEED, { shouldValidate: true });
    setErro(null);
  }

  return (
    <div className="grid min-h-full lg:grid-cols-[1.05fr_1fr]">
      {/* Painel de marca */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-surface/40 p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#cdfa50 1px, transparent 1px), linear-gradient(90deg, #cdfa50 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-ink shadow-glow">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="4" height="4" rx="1" />
            </svg>
          </span>
          <span className="font-display text-2xl font-bold tracking-tight">
            Pixel<span className="text-accent">Press</span>
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="label-mono mb-4">Catálogo · Biblioteca · Reviews · Moderação</p>
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight">
            Seu acervo de jogos,{' '}
            <span className="text-accent">organizado como um arcade.</span>
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Busque no catálogo real da RAWG, monte sua biblioteca, avalie seus jogos e acompanhe a
            moderação. A interface espelha exatamente os papéis e permissões do backend.
          </p>
        </div>

        <p className="relative font-mono text-[10px] uppercase tracking-widest text-muted-2">
          MVP atividade-2 · React + TypeScript strict
        </p>
      </aside>

      {/* Formulário */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold tracking-tight">Entrar</h2>
            <p className="mt-1.5 text-sm text-muted">Use uma das credenciais do seed para a demo.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="username" placeholder="voce@pixelpress.dev" {...register('email')} />
              <FieldError>{formState.errors.email?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" autoComplete="current-password" placeholder="••••••••" {...register('senha')} />
              <FieldError>{formState.errors.senha?.message}</FieldError>
            </div>

            {erro && (
              <div className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {erro}
              </div>
            )}

            <Button type="submit" tamanho="lg" className="w-full" carregando={formState.isSubmitting}>
              Entrar
            </Button>
          </form>

          <div className="mt-8">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="label-mono">Credenciais do seed</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ATALHOS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => preencher(a.email)}
                  className="focus-ring group flex flex-col items-start gap-1 rounded-lg border border-line bg-surface-2/50 p-3 text-left transition-colors hover:border-accent/40 hover:bg-surface-2"
                >
                  <Badge className={a.cor}>{a.papel}</Badge>
                  <span className="truncate font-mono text-[10px] text-muted-2 group-hover:text-muted">
                    {a.email}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-center font-mono text-[10px] text-muted-2">
              senha de todos: <span className="text-muted">{SENHA_SEED}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
