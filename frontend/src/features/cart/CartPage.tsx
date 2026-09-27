import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from './cartStore';
import { ProductImage } from '@/components/ProductImage';
import { EmptyState } from '@/components/EmptyState';
import { formatPrice } from '@/lib/utils';

export function CartPage() {
  const { items, setQty, remove, totalCents } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="page-container py-16">
        <EmptyState
          title="Your cart is empty"
          description="Nothing here yet. Let's fix that — the good stuff is one click away."
          ctaLabel="Browse products"
          ctaHref="/products"
        />
      </div>
    );
  }

  const subtotal = totalCents();
  const currency = items[0]?.currency ?? 'INR';
  const shippingFree = subtotal >= 49900;
  const shippingCents = shippingFree ? 0 : 4900;
  const total = subtotal + shippingCents;

  return (
    <div className="page-container py-12 md:py-16">
      <div className="mb-10">
        <p className="eyebrow text-sky">Your cart</p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
          Almost yours
        </h1>
      </div>

      {!shippingFree && (
        <div className="mb-8 rounded-3xl border border-line bg-gradient-to-r from-sky-tint/60 to-mint-tint/60 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">
              You're {formatPrice(49900 - subtotal, currency)} away from free shipping
            </span>
            <span className="text-xs font-semibold text-ink-mute">
              {Math.min(100, Math.round((subtotal / 49900) * 100))}%
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper">
            <div
              className="h-full rounded-full bg-sky transition-all duration-500"
              style={{ width: `${Math.min(100, (subtotal / 49900) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {shippingFree && (
        <div className="mb-8 rounded-3xl border border-line bg-mint-tint px-5 py-4 text-sm font-medium text-mint-dark">
          🎉 You've unlocked free shipping
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="card-soft flex gap-4 p-4 transition-all duration-300 hover:shadow-soft md:gap-6 md:p-5"
            >
              <Link to={`/products/${item.slug}`} className="w-24 shrink-0 md:w-32">
                <ProductImage src={item.imageUrl} alt={item.name} />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      to={`/products/${item.slug}`}
                      className="font-semibold text-ink transition-colors hover:text-sky"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-ink-mute">SKU: {item.sku}</p>
                  </div>
                  <button
                    onClick={() => remove(item.productId)}
                    className="rounded-full p-2 text-ink-mute transition-colors hover:bg-clay-tint hover:text-clay"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center rounded-full border border-line bg-paper">
                    <button
                      onClick={() => setQty(item.productId, item.quantity - 1)}
                      className="p-2.5 text-ink-soft transition-colors hover:text-ink"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQty(item.productId, item.quantity + 1)}
                      className="p-2.5 text-ink-soft transition-colors hover:text-ink"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-ink">
                    {formatPrice(item.unitPriceCents * item.quantity, item.currency)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-4xl border border-line bg-paper p-6 shadow-soft">
            <h2 className="text-lg font-bold text-ink">Order summary</h2>

            <div className="mt-6 space-y-3 border-b border-line pb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Subtotal</span>
                <span className="font-semibold text-ink">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Shipping</span>
                <span className="font-semibold text-ink">
                  {shippingFree ? (
                    <span className="text-mint-dark">Free</span>
                  ) : (
                    formatPrice(shippingCents, currency)
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-baseline justify-between">
              <span className="text-sm font-semibold text-ink-soft">Total</span>
              <span className="text-2xl font-bold text-ink">
                {formatPrice(total, currency)}
              </span>
            </div>

            {!shippingFree && (
              <p className="mt-3 text-xs text-ink-mute">
                Add {formatPrice(49900 - subtotal, currency)} more for free shipping
              </p>
            )}

            <button
              onClick={() => navigate('/checkout')}
              className="btn-glow-lg mt-6 w-full"
            >
              Proceed to checkout
              <ArrowRight className="h-4 w-4" />
            </button>

            <Link
              to="/products"
              className="mt-4 block text-center text-xs font-medium text-ink-soft transition-colors hover:text-sky"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
