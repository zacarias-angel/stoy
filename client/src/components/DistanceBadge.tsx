export function DistanceBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800">
      {label}
    </span>
  );
}
