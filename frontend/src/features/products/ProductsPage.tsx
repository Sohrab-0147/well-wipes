import { usePageTitle } from '@/lib/usePageTitle';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { productApi } from '@/api/products';
import { ProductCard } from '@/components/ProductCard';
import { cn } from '@/lib/utils';

export function ProductsPage() {
  usePageTitle('Shop');
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const q = searchParams.get('q') ?? '';

  // Reset page when query changes
  useEffect(() => setPage(0), [q]);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: productApi.categories,
  });

  const productsQuery = useQuery({
    queryKey: ['products', { page, q, categoryId }],
    queryFn: () =>
      productApi.list({
        page,
        size: 12,
        q: q || undefined,
        categoryId,
      }),
  });

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('q');
    setSearchParams(next);
  };

  return (
    <div className="page-container py-12 md:py-16">
      <div className="mb-10">
        <p className="eyebrow text-sky">Shop</p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
          {q ? `Results for "${q}"` : 'All products'}
        </h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          {q
            ? 'Showing products that match your search.'
            : 'Every sheet is made with 100% recycled pulp and shipped plastic-free.'}
        </p>
        {q && (
          <button
            onClick={clearSearch}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-sky/40 hover:text-sky"
          >
            <X className="h-3 w-3" />
            Clear search
          </button>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => { setCategoryId(undefined); setPage(0); }}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition',
            !categoryId ? 'bg-ink text-white' : 'bg-slate-tint text-ink-soft hover:bg-slate-soft'
          )}
        >
          All
        </button>
        {categoriesQuery.data?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setCategoryId(cat.id); setPage(0); }}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition',
              categoryId === cat.id ? 'bg-ink text-white' : 'bg-slate-tint text-ink-soft hover:bg-slate-soft'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {productsQuery.isLoading && (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-3xl bg-slate-soft" />
              <div className="mt-4 h-4 w-3/4 rounded-full bg-slate-soft" />
              <div className="mt-2 h-4 w-1/2 rounded-full bg-slate-soft" />
            </div>
          ))}
        </div>
      )}

      {productsQuery.data && productsQuery.data.content.length === 0 && (
        <div className="rounded-3xl border border-line bg-slate-tint p-16 text-center">
          <p className="text-ink-soft">
            {q ? `No products found for "${q}".` : 'No products found.'}
          </p>
          {(q || categoryId) && (
            <button
              onClick={() => { clearSearch(); setCategoryId(undefined); }}
              className="mt-4 text-sm font-semibold text-sky hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {productsQuery.data && productsQuery.data.content.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {productsQuery.data.content.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {productsQuery.data.totalPages > 1 && (
            <div className="mt-14 flex items-center justify-center gap-3">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="btn-secondary disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-ink-mute">
                Page {page + 1} of {productsQuery.data.totalPages}
              </span>
              <button
                disabled={page >= productsQuery.data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
