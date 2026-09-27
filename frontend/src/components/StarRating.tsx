import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StarRating({ value, size = 'md', className }: Props) {
  const sizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i;
        const half = !filled && value > i - 1 && value < i;
        return (
          <div key={i} className="relative">
            <Star className={cn(sizes, 'text-line-strong')} strokeWidth={1.5} />
            {(filled || half) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: half ? '50%' : '100%' }}
              >
                <Star
                  className={cn(sizes, 'fill-clay text-clay')}
                  strokeWidth={0}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StarInput({
  value,
  onChange,
  size = 'lg',
}: {
  value: number;
  onChange: (v: number) => void;
  size?: 'md' | 'lg';
}) {
  const sizes = {
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  }[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110 active:scale-95"
          aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              sizes,
              i <= value ? 'fill-clay text-clay' : 'text-line-strong'
            )}
            strokeWidth={i <= value ? 0 : 1.5}
          />
        </button>
      ))}
    </div>
  );
}
