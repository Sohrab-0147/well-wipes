import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check, Minus, Plus, ShieldCheck, Truck } from 'lucide-react';
import { productApi } from '@/api/products';
import { useCartStore } from '@/features/cart/cartStore';
import { formatPrice } from '@/lib/utils';
import { ProductImage } from '@/components/ProductImage';
import { useRecentlyViewedStore } from './recentlyViewedStore';
import { RecentlyViewed } from './RecentlyViewed';
import { RelatedProducts } from './RelatedProducts';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCartStore((s) => s.add);
  const pushRecent = useRecentlyViewedStore((s) => s.push);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getBySlug(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    if (product) {
      pushRecent({
        id: product.id,
        slug: product.slug,
        name: product.name,
        priceCents: product.priceCents,
        currency: product.currency,
        imageUrl: product.imageUrl,
      });
    }
  }, [product, pushRecent]);

  if (isLoading) {
    return (
      <div className="page-container py-16">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-slate-soft" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 animate-pulse rounded-full bg-slate-soft" />
            <div className="h-10 w-3/4 animate-pulse rounded-full bg-slate-soft" />
            <div className="h-6 w-1/4 animate-pulse rounded-full bg-slate-soft" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container py-24 text-center">
        <p className="text-ink-soft">Product not found.</p>
        <Link to="/products" className="mt-4 inline-block font-semibold text-sky hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    add(
      {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        unitPriceCents: product.priceCents,
        currency: product.currency,
        imageUrl: product.imageUrl,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const inStock = product.stockQuantity > 0;
  const attrs = product.attributes ?? {};

  return (
    <div>
      <div className="page-container py-10 md:py-14">
        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-sky"
        >
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="grid gap-12 md:grid-cols-2">
          <ProductImage src={product.imageUrl} alt={product.name} />

          <div>
            {product.categoryName && (
              <p className="eyebrow text-sky">{product.categoryName}</p>
            )}
            <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm text-ink-mute">SKU: {product.sku}</p>

            <div className="mt-7 flex items-center gap-4">
              <span className="text-3xl font-bold text-ink">
                {formatPrice(product.priceCents, product.currency)}
              </span>
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-tint px-3 py-1 text-xs font-semibold text-mint-dark">
                  <Check className="h-3 w-3" /> In stock
                </span>
              ) : (
                <span className="rounded-full bg-clay-tint px-3 py-1 text-xs font-semibold text-clay-dark">
                  Out of stock
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-7 leading-relaxed text-ink-soft">{product.description}</p>
            )}

            {Object.keys(attrs).length > 0 && (
              <dl className="mt-8 grid grid-cols-2 gap-4 rounded-3xl bg-slate-tint p-6">
                {Object.entries(attrs).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
                      {k}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-ink">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-9 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-line bg-paper">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-3 text-ink-soft transition hover:text-ink disabled:opacity-40"
                  disabled={qty <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(999, q + 1))}
                  className="p-3 text-ink-soft transition hover:text-ink"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button onClick={handleAdd} disabled={!inStock} className="btn-primary flex-1">
                {added ? (
                  <>
                    <Check className="h-4 w-4" /> Added to cart
                  </>
                ) : (
                  'Add to cart'
                )}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6">
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-sky" />
                <div>
                  <p className="text-sm font-semibold text-ink">Ships in 24 hours</p>
                  <p className="text-xs text-ink-mute">Delivered in 2–3 days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky" />
                <div>
                  <p className="text-sm font-semibold text-ink">30-day guarantee</p>
                  <p className="text-xs text-ink-mute">Money back if you're not happy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RelatedProducts categoryId={product.categoryId} excludeId={product.id} />
      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}
