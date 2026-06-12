/**
 * Guardas de rota. RBAC na UI é cosmético (UX): a autorização real é do backend.
 * Esconder rota melhora a experiência, não substitui o guard do servidor.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { temPapel, useSession } from './session';
import type { Papel } from '../api/types';

/** Exige sessão. Sem token, redireciona ao login preservando o destino. */
export function RequireAuth() {
  const { autenticado } = useSession();
  const location = useLocation();
  if (!autenticado) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** Exige papel mínimo. Sem permissão, volta ao catálogo. */
export function RequireRole({ minimo }: { minimo: Papel }) {
  const { usuario } = useSession();
  if (!temPapel(usuario?.papel, minimo)) {
    return <Navigate to="/catalogo" replace />;
  }
  return <Outlet />;
}
