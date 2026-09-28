import { Link } from 'react-router-dom';

export function TermsPage() {
  return (
    <main className="paper-page min-h-[100dvh] px-5 py-10 sm:px-8">
      <article className="mx-auto max-w-2xl space-y-8 text-stone-700">
        <header>
          <Link to="/bienvenida" className="font-hand text-lg text-stone-600 underline underline-offset-4">&lt;- volver</Link>
          <h1 className="font-hand mt-5 text-4xl font-bold text-stone-800">Términos, condiciones y modo de uso</h1>
          <p className="mt-2 text-sm text-stone-500">Versión inicial para la beta de En 5 Estoy.</p>
        </header>

        <section className="space-y-2">
          <h2 className="font-hand text-2xl font-semibold text-stone-800">Para qué sirve</h2>
          <p>En 5 Estoy ayuda a encontrar personas cercanas y conocer los oficios, habilidades o servicios que comparten con su comunidad. No es una garantía sobre trabajos, acuerdos, identidad ni resultados entre usuarios.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-hand text-2xl font-semibold text-stone-800">Modo de uso</h2>
          <p>Usá información verdadera, cuidá a las demás personas y mantené las conversaciones dentro de un trato respetuoso. No publiques contenido ilegal, engañoso, discriminatorio, amenazante ni datos personales de terceros sin permiso.</p>
          <p>Podés bloquear y reportar perfiles. La plataforma podrá revisar reportes y limitar cuentas que incumplan estas reglas.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-hand text-2xl font-semibold text-stone-800">Ubicación y privacidad</h2>
          <p>La app usa ubicación para mostrar personas cercanas. Tu ubicación exacta no se entrega a otros usuarios: el mapa utiliza una posición pública aproximada.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-hand text-2xl font-semibold text-stone-800">Membresía y chats</h2>
          <p>La membresía mensual amplía el radio de descubrimiento y permite enviar audios. Crear un perfil, aparecer en el mapa, buscar y usar chat de texto sigue siendo gratuito.</p>
          <p className="font-semibold text-stone-800">Si una membresía vence o se cancela, los chats y su historial no se borran. La cuenta vuelve al radio gratuito y se desactiva únicamente el envío de nuevos audios.</p>
        </section>

        <p className="border-t border-stone-400 pt-5 text-xs leading-5 text-stone-500">Este texto debe ser revisado y completado por asesoramiento legal antes de publicar la aplicación.</p>
      </article>
    </main>
  );
}
