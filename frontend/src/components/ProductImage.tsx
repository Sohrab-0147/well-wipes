import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  src?: string | null;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className }: Props) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <div
      className={cn(
        'relative aspect-square overflow-hidden rounded-3xl transition-all duration-300',
        showFallback ? 'bg-gradient-to-br from-sky-tint via-mint-tint to-slate-tint' : 'bg-slate-soft',
        className
      )}
    >
      {showFallback ? (
        <div className="flex h-full w-full items-center justify-center">
          <StackMark className="h-16 w-16 text-sky/50" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      )}
    </div>
  );
}

export function StackMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect x="6" y="3" width="20" height="7" rx="3.5" fill="currentColor" opacity="0.35" />
      <rect x="3" y="10" width="26" height="8" rx="4" fill="currentColor" opacity="0.6" />
      <rect x="1" y="18" width="30" height="10" rx="5" fill="currentColor" />
    </svg>
  );
}
