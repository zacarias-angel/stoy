import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextField({
  label,
  hint,
  error,
  id,
  name,
  className = '',
  ...props
}: TextFieldProps) {
  const inputId = id ?? name ?? label;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={[
          'w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-100',
          error ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-brand-600',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {hint && !error && <p className="text-xs text-stone-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
