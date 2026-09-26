import { CrosshairIcon, MapPinIcon } from './icons';

interface MapControlsProps {
  onLocate: (force?: boolean) => void;
  onOpenLocationMenu: () => void;
  locating: boolean;
}

export function MapControls({ onLocate, onOpenLocationMenu, locating }: MapControlsProps) {
  return (
    <div className="absolute bottom-4 left-3 z-20 flex flex-col gap-2">
      <button
        type="button"
        onClick={() => onLocate(true)}
        aria-label="Centrar en mi ubicacion"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-md transition-colors hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {locating ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-brand-700" />
        ) : (
          <CrosshairIcon width={20} height={20} />
        )}
      </button>
      <button
        type="button"
        onClick={onOpenLocationMenu}
        aria-label="Ajustar mi ubicacion"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-md transition-colors hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <MapPinIcon width={20} height={20} />
      </button>
    </div>
  );
}
