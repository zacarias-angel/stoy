import { Link, Navigate } from 'react-router-dom';
import { FullScreenLoader } from '../components/Loader';
import { useAuth } from '../lib/auth';

export function IntroPage() {
  const { profile, loading } = useAuth();

  if (loading) return <FullScreenLoader label="Abriendo el barrio..." />;
  if (profile) return <Navigate to="/" replace />;

  return (
    <main
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#f8f4e9] bg-cover bg-center px-6 py-12"
      style={{ backgroundImage: "url('/asset/backgroud.png')" }}
    >
      <div className="relative z-10 mt-12 w-full max-w-xs text-center sm:mt-0">
        <p className="font-hand text-2xl leading-tight text-stone-800">Hay gente cerca que sabe hacer lo que necesitás.</p>
        <div className="mt-7 flex flex-col items-center gap-3">
          <Link to="/register" className="hand-action w-fit border-2 border-stone-800 bg-[#f8f4e9]/90 px-5 py-3 text-lg font-semibold text-stone-800 shadow-[2px_3px_0_rgba(57,54,47,0.25)] transition-transform hover:-rotate-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-700">
            ( quiero aparecer en el mapa -&gt; )
          </Link>
          <Link to="/login" className="font-hand text-lg text-stone-700 underline decoration-stone-500 underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-700">
            ya tengo cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}
