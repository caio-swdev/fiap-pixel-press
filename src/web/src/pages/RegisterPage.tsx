import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '../auth/session';
import { ApiError } from '../api/errors';
import { Button } from '../components/ui/Button';
import { Input, Label, FieldError } from '../components/ui/Field';

const schema = z.object({
  nome: z.string().min(2, 'Informe ao menos 2 caracteres.').max(80, 'Máximo de 80 caracteres.'),
  email: z.string().email('Informe um e-mail válido.'),
  senha: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres.').max(72, 'Máximo de 72 caracteres.'),
});
type FormValores = z.infer<typeof schema>;

export function RegisterPage() {
  const { autenticado, registrar } = useSession();
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<FormValores>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', email: '', senha: '' },
  });

  if (autenticado) return <Navigate to="/catalogo" replace />;

  async function onSubmit(valores: FormValores) {
    setErro(null);
    try {
      await registrar(valores);
      navigate('/catalogo', { replace: true });
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível criar a conta.');
    }
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
            Crie sua conta e{' '}
            <span className="text-accent">monte seu acervo.</span>
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Toda conta nova entra como Usuário. Busque no catálogo real da RAWG, organize sua
            biblioteca e avalie seus jogos.
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
            <h2 className="font-display text-2xl font-bold tracking-tight">Criar conta</h2>
            <p className="mt-1.5 text-sm text-muted">Leva menos de um minuto.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" type="text" autoComplete="name" placeholder="Seu nome" {...register('nome')} />
              <FieldError>{formState.errors.nome?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="username" placeholder="voce@pixelpress.dev" {...register('email')} />
              <FieldError>{formState.errors.email?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" autoComplete="new-password" placeholder="••••••••" {...register('senha')} />
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
              Criar conta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Já tem conta?{' '}
            <Link to="/login" className="font-medium text-accent hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
