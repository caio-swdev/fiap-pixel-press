import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-bold tracking-tighter text-accent">404</p>
      <h1 className="mt-4 font-display text-xl font-bold">Página não encontrada</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        O endereço que você tentou abrir não existe nesta SPA.
      </p>
      <Link to="/catalogo" className="mt-6">
        <Button>Voltar ao catálogo</Button>
      </Link>
    </div>
  );
}
