import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import type { Membership } from '../lib/types';

function formatArs(value: number) {
  return new Intl.NumberFormat('es-AR').format(value);
}

export function MembershipPage() {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiFetch<Membership>('/api/memberships/me')
      .then(setMembership)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return <section className="paper-page flex min-h-full items-center justify-center p-6"><p className="hand-note text-xl text-stone-600">No pudimos revisar tu membresía. Intentá de nuevo.</p></section>;
  }

  if (!membership) {
    return <section className="paper-page flex min-h-full items-center justify-center p-6"><p className="hand-note animate-pencil-in text-xl text-stone-600">haciendo las cuentas...</p></section>;
  }

  const statusText = membership.isActive
    ? 'tu membresía está activa'
    : 'llegá un poco más lejos';

  return (
    <section className="paper-page min-h-full overflow-hidden px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="hand-note text-xl text-stone-500">Membresía En 5 Estoy</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-800">{statusText}</h1>

        <div className="relative mx-auto my-12 w-fit text-center animate-pencil-in" aria-live="polite">
          <span className="hand-note block text-lg text-stone-500">un solo plan</span>
          <div className="answer-number relative px-8 py-5">
            <strong className="font-hand block text-5xl font-bold leading-none tracking-[-0.08em] text-stone-800 sm:text-7xl">AR$ {formatArs(membership.priceArs)}</strong>
            <span className="font-hand mt-2 block text-2xl text-stone-600">/ mes</span>
          </div>
        </div>

        <div className="relative mx-auto max-w-xl space-y-6 text-center text-stone-700">
          <p className="hand-note -rotate-1 text-xl">~ ampliás tu zona para descubrir más gente cercana</p>
          <p className="hand-note rotate-1 text-xl">~ podés enviar audios en tus chats</p>
          <p className="mx-auto max-w-md text-sm leading-6 text-stone-500">Seguir apareciendo en el mapa, buscar y hablar por texto siempre es gratis.</p>
        </div>

        {membership.isActive ? (
          <p className="hand-note mx-auto mt-12 w-fit -rotate-1 border-b-2 border-stone-600 px-4 pb-1 text-xl text-stone-700">activa hasta {membership.expiresAt ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(membership.expiresAt)) : 'nuevo aviso'}</p>
        ) : (
          <p className="hand-note mx-auto mt-12 max-w-md text-center text-lg text-stone-500">El pago seguro se procesa con Mercado Pago. Estamos conectando la suscripción.</p>
        )}
      </div>
    </section>
  );
}
