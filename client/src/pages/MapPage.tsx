import { useAuth } from '../lib/auth';

export function MapPage() {
  const { profile } = useAuth();

  return (
    <section className="px-4 py-5">
      <h1 className="text-lg font-semibold text-stone-900">
        {profile ? `Hola, ${profile.name.split(' ')[0]}` : 'Hola'}
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Quien tenes cerca y que sabe hacer?
      </p>

      <div className="mt-5 flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </span>
        <p className="text-sm font-medium text-stone-700">El mapa llega en la Fase 2</p>
        <p className="max-w-xs text-xs text-stone-500">
          Aca vas a ver a las personas cercanas, su oficio y a cuantos minutos estan de vos.
        </p>
      </div>
    </section>
  );
}
