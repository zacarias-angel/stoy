interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-20 w-20 text-xl',
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const classes = [
    'flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold',
    sizeClasses[size],
  ].join(' ');

  if (src) {
    return (
      <div className={classes}>
        <img src={src} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${classes} bg-brand-100 text-brand-800`} aria-hidden>
      {getInitials(name) || '?'}
    </div>
  );
}
