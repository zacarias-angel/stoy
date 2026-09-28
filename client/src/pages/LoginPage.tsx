import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { useAuth } from '../lib/auth';

export function LoginPage() {
  const { profile, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (profile) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center bg-[#f8f4e9] bg-cover bg-center px-6 py-10" style={{ backgroundImage: "url('/asset/backgroud.png')" }}>
      <div className="paper-panel mx-auto w-full max-w-sm space-y-8 rounded-[1.4rem_1.15rem_1.5rem_1.2rem] p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-brand-800">En 5 Estoy</h1>
          <p className="text-sm text-stone-500">
            Hay gente cerca que sabe hacer lo que necesitas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            label="Contrasena"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500">
          No tenes cuenta?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Crear cuenta
          </Link>
        </p>
        <Link to="/terminos" className="block text-center text-xs text-stone-500 underline underline-offset-4">Términos, condiciones y modo de uso</Link>
      </div>
    </div>
  );
}
