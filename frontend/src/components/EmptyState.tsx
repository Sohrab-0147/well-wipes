import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { StackMark } from './ProductImage';

interface Props {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({ title, description, ctaLabel, ctaHref }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-4xl bg-gradient-to-br from-sky-tint to-mint-tint">
        <StackMark className="h-10 w-10 text-sky" />
      </div>
      <h2 className="mt-8 text-2xl font-bold text-ink">{title}</h2>
      <p className="mt-3 max-w-md text-ink-soft">{description}</p>
      {ctaLabel && ctaHref && (
        <Link to={ctaHref} className="btn-glow mt-8">
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
