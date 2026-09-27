import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check, Heart, Leaf, Minus, Package, Plus, RefreshCw, ShieldCheck } from 'lucide-react';
import { productApi } from '@/api/products';
import { useCartStore } from '@/features/cart/cartStore';
import { formatPrice } from '@/lib/utils';
import { ProductImage } from '@/components/ProductImage';
import { useRecentlyViewedStore } from './recentlyViewedStore';
import { RecentlyViewed } from './RecentlyViewed';
import { RelatedProducts } from './RelatedProducts';
import { ProductReviews } from './ProductReviews';
import { usePageTitle } from '@/lib/usePageTitle';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';

const trustBadges = [
  { icon: Package, label: 'Free shipping over ₹499' },
  { icon: RefreshCw, label: 'Ships within 24 hours' },
  { icon: Leaf, label: '100% recycled' },
  { icon: ShieldCheck, label: '30-day guarantee' },
];

export function ProductDetailPage() {
  usePageTitle(undefined);
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
          <div className="aspect-square animate-pulse rounded-4xl bg-slate-soft" />
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
      <div className="page-container py-8 md:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Shop', to: '/products' },
              ...(product.categoryName
                ? [{ label: product.categoryName, to: `/products?category=${product.categorySlug ?? ''}` }]
                : []),
              { label: product.name },
            ]}
          />
          <Link
            to="/products"
            className="hidden items-center gap-1.5 text-xs font-medium text-ink-soft transition-colors hover:text-sky md:inline-flex"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to shop
          </Link>
        </div>

        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div className="md:sticky md:top-24 md:self-start">
            <ProductImage src={product.imageUrl} alt={product.name} />
          </div>

          <div>
            {product.categoryName && (
              <p className="eyebrow text-sky">{product.categoryName}</p>
            )}
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 text-xs text-ink-mute">SKU · {product.sku}</p>

            <div className="mt-7 flex items-center gap-4">
              <span className="text-3xl font-bold tracking-tight text-ink">
                {formatPrice(product.priceCents, product.currency)}
              </span>
              {inStock ? (
                <span className="chip-mint">
                  <Check className="h-3 w-3" /> In stock
                </span>
              ) : (
                <span className="chip-clay">Out of stock</span>
              )}
            </div>

            {product.description && (
              <p className="mt-7 leading-relaxed text-ink-soft">{product.description}</p>
            )}

            {Object.keys(attrs).length > 0 && (
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-3xl bg-slate-tint p-6">
                {Object.entries(attrs).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                      {k}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-ink">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-9 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-line-strong bg-paper">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-3 text-ink-soft transition hover:text-ink disabled:opacity-40"
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(999, q + 1))}
                  className="p-3 text-ink-soft transition hover:text-ink"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={!inStock}
                className="btn-primary flex-1"
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" /> Added to cart
                  </>
                ) : (
                  'Add to cart'
                )}
              </button>

              <button
                onClick={() => {
                  const wishlistKey = 'ww-wishlist';
                  const existing: string[] = JSON.parse(localStorage.getItem(wishlistKey) ?? '[]');
                  if (!existing.includes(product.id)) {
                    existing.push(product.id);
                    localStorage.setItem(wishlistKey, JSON.stringify(existing));
                  }
                }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-strong bg-paper text-ink-soft transition-all hover:border-clay/40 hover:text-clay"
                aria-label="Save for later"
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-line pt-8">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-tint text-sky">
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <span className="text-xs font-medium text-ink-soft">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} />
      <StickyMobileCTA
        name={product.name}
        priceCents={product.priceCents}
        currency={product.currency}
        onAdd={handleAdd}
        disabled={!inStock}
      />
      <RelatedProducts categoryId={product.categoryId} excludeId={product.id} />
      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}
