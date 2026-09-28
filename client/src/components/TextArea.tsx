import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function TextArea({ label, hint, id, name, className = '', ...props }: TextAreaProps) {
  const textareaId = id ?? name ?? label;

  return (
    <div className="space-y-1.5">
      <label htmlFor={textareaId} className="font-hand block text-lg text-stone-700">
        {label}
      </label>
      <textarea
        id={textareaId}
        name={name}
        className={[
           'input-line w-full resize-none bg-transparent px-2 py-2 text-base text-stone-900 placeholder:text-stone-400 focus:border-stone-800 focus:outline-none',
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
