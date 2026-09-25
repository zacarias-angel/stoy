export function ChatsPage() {
  return (
    <section className="px-4 py-5">
      <h1 className="text-lg font-semibold text-stone-900">Chats</h1>
      <p className="mt-1 text-sm text-stone-500">
        Tus conversaciones con personas cercanas.
      </p>

      <div className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center">
        <p className="text-sm font-medium text-stone-700">Todavia no hay conversaciones</p>
        <p className="mt-1 text-xs text-stone-500">
          Cuando hables con alguien desde el mapa, la conversacion va a aparecer aca.
        </p>
      </div>
    </section>
  );
}
