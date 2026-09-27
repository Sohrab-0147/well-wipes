import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/api/products';
import { ProductCard } from '@/components/ProductCard';

export function RelatedProducts({
  categoryId,
  excludeId,
}: {
  categoryId?: string | null;
  excludeId: string;
}) {
  const { data } = useQuery({
    queryKey: ['products', 'related', categoryId],
    queryFn: () =>
      productApi.list({ categoryId: categoryId ?? undefined, page: 0, size: 8 }),
    enabled: !!categoryId,
  });

  const items = data?.content.filter((p) => p.id !== excludeId).slice(0, 4) ?? [];
  if (items.length === 0) return null;

  return (
    <section className="page-container py-16 md:py-20">
      <div className="mb-8">
        <p className="eyebrow text-sky">You might also like</p>
        <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">
          More from this range
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
