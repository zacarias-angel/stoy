import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { FullScreenLoader } from './components/Loader';
import { RequireAuth } from './components/RequireAuth';
import { AuthProvider } from './lib/auth';
import { ChatsPage } from './pages/ChatsPage';
import { IntroPage } from './pages/IntroPage';
import { LoginPage } from './pages/LoginPage';
import { MembershipPage } from './pages/MembershipPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { TermsPage } from './pages/TermsPage';

const MapPage = lazy(() =>
  import('./pages/MapPage').then((module) => ({ default: module.MapPage }))
);

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<FullScreenLoader label="Cargando mapa..." />}>
          <Routes>
            <Route path="/bienvenida" element={<IntroPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/terminos" element={<TermsPage />} />
            <Route
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route path="/" element={<MapPage />} />
              <Route path="/chats" element={<ChatsPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
              <Route path="/membresia" element={<MembershipPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/bienvenida" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
