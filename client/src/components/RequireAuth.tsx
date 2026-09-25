import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { FullScreenLoader } from './Loader';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
