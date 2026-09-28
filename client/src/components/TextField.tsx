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
      <label htmlFor={inputId} className="font-hand block text-lg text-stone-700">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={[
           'input-line w-full bg-transparent px-2 py-2 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none',
           error ? 'border-red-500 focus:border-red-600' : 'border-stone-600 focus:border-stone-800',
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
