import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useRecentlyViewedStore } from './recentlyViewedStore';
import { ProductImage } from '@/components/ProductImage';
import { formatPrice } from '@/lib/utils';

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const items = useRecentlyViewedStore((s) => s.items);
  const filtered = excludeId ? items.filter((i) => i.id !== excludeId) : items;

  if (filtered.length === 0) return null;

  return (
    <section className="page-container py-16 md:py-20">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-tint">
          <Clock className="h-4 w-4 text-sky" />
        </div>
        <h2 className="text-2xl font-extrabold">Recently viewed</h2>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
        {filtered.map((p) => (
          <Link key={p.id} to={`/products/${p.slug}`} className="group block">
            <ProductImage src={p.imageUrl} alt={p.name} />
            <p className="mt-3 line-clamp-2 text-sm font-medium text-ink transition group-hover:text-sky">
              {p.name}
            </p>
            <p className="mt-1 text-sm font-bold text-ink">
              {formatPrice(p.priceCents, p.currency)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
