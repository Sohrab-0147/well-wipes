import { usePageTitle } from '@/lib/usePageTitle';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Edit2, Package, Plus, Search, Trash2 } from 'lucide-react';
import { adminProductApi, type ProductSummary } from '@/api/products';
import { formatPrice } from '@/lib/utils';
import { toast } from '@/lib/toastStore';

export function AdminProductsPage() {
  usePageTitle('Products');
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminProductApi.list(0, 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminProductApi.remove(id),
    onSuccess: () => {
      toast.success('Product deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const handleDelete = (p: ProductSummary) => {
    if (confirm(`Delete "${p.name}"? This can't be undone.`)) {
      deleteMutation.mutate(p.id);
    }
  };

  const filtered = data?.content.filter((p) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-sky">Catalog</p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Products</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {data?.content.length ?? 0} products in your catalog
          </p>
        </div>
        <Link to="/admin/products/new" className="btn-glow">
          <Plus className="h-4 w-4" />
          New product
        </Link>
      </div>

      <div className="rounded-3xl border border-line bg-paper shadow-soft">
        <div className="border-b border-line p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or SKU…"
              className="input pl-11"
            />
          </div>
        </div>

        {isLoading && (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-tint" />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-tint">
              <Package className="h-6 w-6 text-sky" />
            </div>
            <p className="mt-4 text-sm font-semibold text-ink">
              {search ? 'No products match your search' : 'No products yet'}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {search ? 'Try a different query.' : 'Add your first product to get started.'}
            </p>
            {!search && (
              <Link to="/admin/products/new" className="btn-glow mt-6 inline-flex">
                <Plus className="h-4 w-4" />
                Add product
              </Link>
            )}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-ink-mute">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-right">Stock</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-b-0 transition-colors hover:bg-slate-tint/40">
                    <td className="px-6 py-4">
                      <Link to={`/admin/products/${p.id}/edit`} className="font-medium text-ink hover:text-sky">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-ink-soft">{p.sku}</td>
                    <td className="px-6 py-4 text-ink-soft">{p.categoryName ?? '—'}</td>
                    <td className="px-6 py-4 text-right font-semibold text-ink">
                      {formatPrice(p.priceCents, p.currency)}
                    </td>
                    <td className="px-6 py-4 text-right text-ink-soft">—</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-mint-tint px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mint-dark">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="rounded-full p-2 text-ink-soft transition-colors hover:bg-sky-tint hover:text-sky"
                          aria-label="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p)}
                          className="rounded-full p-2 text-ink-soft transition-colors hover:bg-clay-tint hover:text-clay"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
