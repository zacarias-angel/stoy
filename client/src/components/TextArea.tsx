import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function TextArea({ label, hint, id, name, className = '', ...props }: TextAreaProps) {
  const textareaId = id ?? name ?? label;

  return (
    <div className="space-y-1.5">
      <label htmlFor={textareaId} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <textarea
        id={textareaId}
        name={name}
        className={[
          'w-full resize-none rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {hint && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  );
}
