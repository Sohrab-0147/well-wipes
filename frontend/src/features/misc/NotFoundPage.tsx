import { Link } from 'react-router-dom';
import { ArrowRight, Home } from 'lucide-react';
import { StackMark } from '@/components/ProductImage';

export function NotFoundPage() {
  return (
    <div className="page-container flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-4xl bg-gradient-to-br from-sky-tint to-mint-tint">
        <StackMark className="h-10 w-10 text-sky" />
      </div>
      <p className="eyebrow mt-8 text-sky">404</p>
      <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
        This page went missing.
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        Maybe it's in the other room. Let's get you back to something useful.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="btn-glow">
          <Home className="h-4 w-4" />
          Back home
        </Link>
        <Link to="/products" className="btn-secondary">
          Browse products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
