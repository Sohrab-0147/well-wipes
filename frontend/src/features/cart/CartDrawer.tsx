import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCartStore } from './cartStore';
import { useCartDrawerStore } from './cartDrawerStore';
import { ProductImage } from '@/components/ProductImage';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const { open, closeDrawer } = useCartDrawerStore();
  const { items, setQty, remove, totalCents } = useCartStore();
  const navigate = useNavigate();

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeDrawer]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const subtotal = totalCents();
  const currency = items[0]?.currency ?? 'INR';
  const shippingFree = subtotal >= 49900;
  const shippingCents = shippingFree ? 0 : 4900;
  const total = subtotal + shippingCents;
  const awayFromFree = Math.max(0, 49900 - subtotal);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60]',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className={cn(
          'absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Drawer panel */}
      <aside
        className={cn(
          'absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-paper shadow-lift transition-transform duration-300 ease-smooth',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-ink" />
            <h2 className="text-base font-bold">
              Your cart
              {items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-ink-mute">
                  ({items.reduce((n, i) => n + i.quantity, 0)} item{items.length > 1 ? 's' : ''})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="rounded-full p-2 text-ink-mute transition-colors hover:bg-slate-tint hover:text-ink"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Free shipping banner */}
        {items.length > 0 && (
          <div className="border-b border-line bg-gradient-to-r from-sky-tint/60 to-mint-tint/60 px-5 py-3">
            {shippingFree ? (
              <p className="text-xs font-semibold text-mint-dark">
                🎉 You've unlocked free shipping
              </p>
            ) : (
              <>
                <p className="text-xs font-medium text-ink-soft">
                  Add <span className="font-bold text-ink">{formatPrice(awayFromFree, currency)}</span> more for free shipping
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper">
                  <div
                    className="h-full rounded-full bg-sky transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / 49900) * 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-tint">
                <ShoppingBag className="h-7 w-7 text-sky" />
              </div>
              <p className="mt-5 text-base font-bold text-ink">Your cart is empty</p>
              <p className="mt-1 text-sm text-ink-soft">
                Nothing here yet. Let's fix that.
              </p>
              <button
                onClick={() => {
                  closeDrawer();
                  navigate('/products');
                }}
                className="btn-glow mt-6"
              >
                Browse products
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 p-5">
                  <Link
                    to={`/products/${item.slug}`}
                    onClick={closeDrawer}
                    className="w-20 shrink-0"
                  >
                    <ProductImage src={item.imageUrl} alt={item.name} />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        to={`/products/${item.slug}`}
                        onClick={closeDrawer}
                        className="line-clamp-2 text-sm font-semibold text-ink transition-colors hover:text-sky"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => remove(item.productId)}
                        className="shrink-0 rounded-full p-1.5 text-ink-mute transition-colors hover:bg-clay-tint hover:text-clay"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-ink-mute">SKU · {item.sku}</p>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-line bg-paper">
                        <button
                          onClick={() => setQty(item.productId, item.quantity - 1)}
                          className="p-2 text-ink-soft transition-colors hover:text-ink"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQty(item.productId, item.quantity + 1)}
                          className="p-2 text-ink-soft transition-colors hover:text-ink"
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-ink">
                        {formatPrice(item.unitPriceCents * item.quantity, item.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-line bg-paper p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal</span>
                <span className="font-semibold text-ink">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Shipping</span>
                <span className="font-semibold text-ink">
                  {shippingFree ? (
                    <span className="text-mint-dark">Free</span>
                  ) : (
                    formatPrice(shippingCents, currency)
                  )}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <span className="text-sm font-semibold text-ink-soft">Total</span>
                <span className="text-lg font-bold text-ink">
                  {formatPrice(total, currency)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                closeDrawer();
                navigate('/checkout');
              }}
              className="btn-glow-lg mt-5 w-full"
            >
              Checkout
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                closeDrawer();
                navigate('/cart');
              }}
              className="mt-3 w-full text-center text-xs font-medium text-ink-soft transition-colors hover:text-sky"
            >
              View full cart
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
