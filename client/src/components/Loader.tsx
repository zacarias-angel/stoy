export function FullScreenLoader({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex min-h-full items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-3 text-stone-500">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-brand-700" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
