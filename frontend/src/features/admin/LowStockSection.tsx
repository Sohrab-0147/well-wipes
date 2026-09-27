import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
import { lowStockApi } from '@/api/products';

export function LowStockSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'low-stock'],
    queryFn: lowStockApi.list,
    refetchInterval: 60_000,
  });

  const count = data?.length ?? 0;
  const hasAlerts = count > 0;

  return (
    <div className="mt-10 rounded-3xl border border-line bg-paper shadow-soft">
      <div className="flex items-center justify-between border-b border-line px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
              hasAlerts ? 'bg-clay-tint' : 'bg-mint-tint'
            }`}
          >
            {hasAlerts ? (
              <AlertTriangle className="h-5 w-5 text-clay" strokeWidth={1.8} />
            ) : (
              <Package className="h-5 w-5 text-mint-dark" strokeWidth={1.8} />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">
              {hasAlerts ? 'Low stock alerts' : 'Stock levels'}
            </h2>
            <p className="mt-0.5 text-xs text-ink-mute">
              {hasAlerts
                ? `${count} ${count === 1 ? 'product needs' : 'products need'} restocking`
                : 'All products are above their thresholds'}
            </p>
          </div>
        </div>
        {hasAlerts && (
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-sky transition-colors hover:text-sky-dark"
          >
            Manage
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3 p-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-tint" />
          ))}
        </div>
      )}

      {!isLoading && !hasAlerts && (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-ink-soft">
            Nothing needs your attention right now.
          </p>
        </div>
      )}

      {!isLoading && hasAlerts && (
        <div className="divide-y divide-line">
          {data!.map((p) => {
            const pct = Math.min(100, Math.round((p.stockQuantity / Math.max(1, p.lowStockThreshold)) * 100));
            const critical = p.stockQuantity === 0;
            return (
              <Link
                key={p.id}
                to={`/admin/products/${p.id}/edit`}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-tint/40"
              >
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-ink">{p.name}</p>
                    {critical && (
                      <span className="shrink-0 rounded-full bg-clay px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Out
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-ink-mute">
                    SKU {p.sku}
                    {p.categoryName && <> · {p.categoryName}</>}
                  </p>
                  <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-tint">
                    <div
                      className={`h-full rounded-full transition-all ${
                        critical ? 'bg-clay' : 'bg-sky'
                      }`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${critical ? 'text-clay' : 'text-ink'}`}>
                    {p.stockQuantity}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">
                    of {p.lowStockThreshold}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
