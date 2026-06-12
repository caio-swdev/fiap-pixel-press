import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { RequireAuth, RequireRole } from './auth/guards';
import { LoginPage } from './pages/LoginPage';
import { CatalogPage } from './pages/CatalogPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { LibraryPage } from './pages/LibraryPage';
import { ModerationPage } from './pages/ModerationPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Tudo abaixo exige sessão (guarda de rota privada). */}
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/catalogo" replace />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/jogo/:slug" element={<GameDetailPage />} />
          <Route path="/biblioteca" element={<LibraryPage />} />

          {/* Moderador+ */}
          <Route element={<RequireRole minimo="MODERADOR" />}>
            <Route path="/moderacao" element={<ModerationPage />} />
          </Route>

          {/* Admin */}
          <Route element={<RequireRole minimo="ADMIN" />}>
            <Route path="/admin/usuarios" element={<AdminUsersPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
