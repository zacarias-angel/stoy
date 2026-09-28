import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

const base =
  'hand-action inline-flex items-center justify-center gap-2 border-2 border-stone-700 bg-transparent px-4 py-2.5 text-base font-semibold text-stone-800 transition-transform hover:-rotate-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'border-stone-700 text-stone-800 hover:bg-stone-800/5',
  secondary: 'border-stone-500 text-stone-700 hover:bg-stone-800/5',
  ghost: 'border-transparent text-stone-600 hover:border-stone-400 hover:bg-transparent',
};

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [
    base,
    variants[variant],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <button type={type} className={classes} {...props} />;
}
