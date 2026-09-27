import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function CheckoutCancelPage() {
  return (
    <div className="page-container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow text-clay">Payment cancelled</p>
      <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">
        No worries — take your time.
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        Nothing was charged. Your cart is still waiting for you.
      </p>
      <Link to="/cart" className="btn-glow mt-8">
        <ArrowLeft className="h-4 w-4" />
        Back to cart
      </Link>
    </div>
  );
}
