import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800',
  secondary: 'bg-brand-50 text-brand-800 hover:bg-brand-100',
  ghost: 'text-stone-600 hover:bg-stone-100',
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
