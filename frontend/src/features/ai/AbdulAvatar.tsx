import { cn } from '@/lib/utils';

export function AbdulAvatar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="abdul-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id="abdul-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde4c8" />
          <stop offset="100%" stopColor="#f5c9a4" />
        </linearGradient>
      </defs>

      {/* Circle background */}
      <rect width="40" height="40" rx="20" fill="url(#abdul-bg)" />

      {/* Shoulders / body hint */}
      <path d="M8 40 Q20 30 32 40 Z" fill="#ffffff" opacity="0.9" />

      {/* Neck */}
      <rect x="17.5" y="24" width="5" height="6" fill="#f5c9a4" />

      {/* Head */}
      <ellipse cx="20" cy="18" rx="8" ry="9" fill="url(#abdul-skin)" />

      {/* Hair — short, dark */}
      <path d="M12 15 Q13 9 20 9 Q27 9 28 15 Q27 12 24 11 Q20 10 16 11 Q13 12 12 15 Z" fill="#1c1917" />

      {/* Left eyebrow */}
      <path d="M14.5 15.2 Q16 14.4 17.5 15" stroke="#1c1917" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      {/* Right eyebrow */}
      <path d="M22.5 15 Q24 14.4 25.5 15.2" stroke="#1c1917" strokeWidth="0.9" strokeLinecap="round" fill="none" />

      {/* Eyes — small, friendly */}
      <circle cx="16" cy="17.8" r="0.9" fill="#1c1917" />
      <circle cx="24" cy="17.8" r="0.9" fill="#1c1917" />

      {/* Glasses */}
      <circle cx="16" cy="18" r="3" stroke="#1c1917" strokeWidth="0.9" fill="none" />
      <circle cx="24" cy="18" r="3" stroke="#1c1917" strokeWidth="0.9" fill="none" />
      <line x1="19" y1="18" x2="21" y2="18" stroke="#1c1917" strokeWidth="0.9" />

      {/* Nose */}
      <path d="M20 18 L19.4 20.4 Q20 20.9 20.6 20.4 Z" fill="#e8a98a" opacity="0.7" />

      {/* Smile */}
      <path
        d="M16.5 22.4 Q20 25 23.5 22.4"
        stroke="#7c2d12"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
