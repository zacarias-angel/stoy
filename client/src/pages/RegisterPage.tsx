import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { TextArea } from '../components/TextArea';
import { TextField } from '../components/TextField';
import { useAuth } from '../lib/auth';

export function RegisterPage() {
  const { profile, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [headline, setHeadline] = useState('');
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
      await register({
        name,
        email,
        password,
        headline: headline.trim() ? headline.trim() : undefined,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center bg-stone-50 px-6 py-10">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-brand-800">Crear cuenta</h1>
          <p className="text-sm text-stone-500">
            Contale a tu barrio que sabes hacer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <TextField
            label="Nombre"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
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
            autoComplete="new-password"
            required
            minLength={8}
            hint="Al menos 8 caracteres."
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <TextArea
            label="Que sabes hacer? (opcional)"
            name="headline"
            rows={2}
            maxLength={120}
            placeholder="Ej: Modista, arreglos de ropa y prendas a medida."
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
          />

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500">
          Ya tenes cuenta?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Ingresar
          </Link>
        </p>
      </div>
    </div>
  );
}
