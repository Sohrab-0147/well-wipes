import { cn } from '@/lib/utils';

interface LogoMarkProps {
  className?: string;
}

/**
 * The Well-Wipes logo mark — stacked WW monogram on a blue gradient.
 * Always renders the same way. To place it on a photo, put it inside
 * a container that has a background image (see HomePage hero).
 */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-2xl',
        className
      )}
      style={{
        backgroundImage:
          'linear-gradient(135deg, #0284c7 0%, #0369a1 55%, #075985 100%)',
      }}
      aria-hidden="true"
    >
      {/* Soft top-light for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/15" />

      {/* Stacked WW monogram */}
      <svg
        viewBox="0 0 32 32"
        className="relative h-[58%] w-auto"
        fill="none"
        aria-hidden="true"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
      >
        <path
          d="M6 6 L11 15 L16 9 L21 15 L26 6"
          stroke="#ffffff"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
        <path
          d="M6 18 L11 27 L16 21 L21 27 L26 18"
          stroke="#ffffff"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.72"
        />
      </svg>
    </div>
  );
}

export function Logo({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const markSize = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }[size];

  const textSize = {
    sm: 'text-base',
    md: 'text-[19px]',
    lg: 'text-2xl',
  }[size];

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className={markSize} />
      <span
        className={cn(
          'font-logo font-extrabold tracking-[-0.02em] text-ink',
          textSize
        )}
      >
        Well-Wipes
      </span>
    </div>
  );
}
