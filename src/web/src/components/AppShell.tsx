import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { temPapel, useSession } from '../auth/session';
import { RoleBadge } from './ui/Badge';
import { Button } from './ui/Button';
import { cn } from '../lib/cn';

interface NavItem {
  to: string;
  rotulo: string;
  visivel: boolean;
}

export function AppShell() {
  const { usuario, sair } = useSession();
  const navigate = useNavigate();

  const itens: NavItem[] = [
    { to: '/catalogo', rotulo: 'Catálogo', visivel: true },
    { to: '/biblioteca', rotulo: 'Biblioteca', visivel: true },
    { to: '/moderacao', rotulo: 'Moderação', visivel: temPapel(usuario?.papel, 'MODERADOR') },
    { to: '/admin/usuarios', rotulo: 'Admin', visivel: temPapel(usuario?.papel, 'ADMIN') },
  ];

  function logout() {
    sair();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <NavLink to="/catalogo" className="group flex shrink-0 items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-accent text-accent-ink shadow-glow-soft transition-transform group-hover:rotate-[-6deg]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="4" height="4" rx="1" />
              </svg>
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-fg">
              Pixel<span className="text-accent">Press</span>
            </span>
          </NavLink>

          <nav className="flex flex-1 items-center gap-1">
            {itens
              .filter((i) => i.visivel)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'focus-ring relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive ? 'text-accent' : 'text-muted hover:text-fg',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.rotulo}
                      {isActive && (
                        <span className="absolute inset-x-3 -bottom-px h-px bg-accent shadow-glow" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
          </nav>

          {usuario && (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2.5 text-right sm:flex">
                <div className="leading-tight">
                  <p className="max-w-[140px] truncate text-sm font-semibold text-fg">
                    {usuario.nome}
                  </p>
                  <p className="font-mono text-[10px] text-muted-2">{usuario.email}</p>
                </div>
                <RoleBadge papel={usuario.papel} />
              </div>
              <Button variante="outline" tamanho="sm" onClick={logout}>
                Sair
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-line py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-2">
            PixelPress · camada de apresentação · /api/v1
          </p>
          <p className="font-mono text-[10px] text-muted-2">RAWG mock · demo MVP</p>
        </div>
      </footer>
    </div>
  );
}
