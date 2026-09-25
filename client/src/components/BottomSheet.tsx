import type { ReactNode } from 'react';
import { CloseIcon } from './icons';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30">
      <div className="pointer-events-auto mx-auto max-w-md px-3 pb-3">
        <div className="relative rounded-2xl border border-stone-200 bg-white p-4 shadow-xl">
          <div className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-stone-200" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          >
            <CloseIcon width={18} height={18} />
          </button>
          <div className="pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
