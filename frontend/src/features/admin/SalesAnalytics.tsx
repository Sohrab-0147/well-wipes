import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { analyticsApi } from '@/api/orders';
import { formatPrice, cn } from '@/lib/utils';
import { RevenueChart } from './RevenueChart';

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

export function SalesAnalytics() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', days],
    queryFn: () => analyticsApi.get(days),
  });

  const trend = (() => {
    if (!data || data.dailyRevenue.length < 14) return null;
    const last7 = data.dailyRevenue.slice(-7).reduce((s, d) => s + d.revenueCents, 0);
    const prev7 = data.dailyRevenue.slice(-14, -7).reduce((s, d) => s + d.revenueCents, 0);
    if (prev7 === 0) return last7 > 0 ? 100 : 0;
    return Math.round(((last7 - prev7) / prev7) * 100);
  })();

  return (
    <div className="mt-10 rounded-3xl border border-line bg-paper shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <h2 className="text-lg font-bold text-ink">Sales analytics</h2>
          <p className="mt-0.5 text-xs text-ink-mute">Revenue and orders over time</p>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-line bg-paper p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                days === r.days
                  ? 'bg-sky text-white shadow-glow-sm'
                  : 'text-ink-soft hover:bg-slate-tint hover:text-ink'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="p-6">
          <div className="h-[240px] animate-pulse rounded-2xl bg-slate-tint" />
        </div>
      )}

      {data && (
        <div className="p-6">
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">
                Revenue
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-xl font-bold text-ink">
                  {formatPrice(data.totalRevenueCents, data.currency)}
                </p>
                {trend !== null && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 text-xs font-semibold',
                      trend >= 0 ? 'text-mint-dark' : 'text-clay'
                    )}
                  >
                    {trend >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(trend)}%
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">
                Orders
              </p>
              <p className="mt-1 text-xl font-bold text-ink">{data.totalOrders}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">
                Avg. order
              </p>
              <p className="mt-1 text-xl font-bold text-ink">
                {formatPrice(data.averageOrderValueCents, data.currency)}
              </p>
            </div>
          </div>

          <RevenueChart data={data.dailyRevenue} currency={data.currency} />

          {data.topProducts.length > 0 && (
            <div className="mt-8 border-t border-line pt-6">
              <h3 className="text-sm font-bold text-ink">Top products</h3>
              <div className="mt-4 space-y-2">
                {data.topProducts.map((p, i) => {
                  const maxUnits = data.topProducts[0].unitsSold;
                  const pct = Math.max(4, Math.round((p.unitsSold / maxUnits) * 100));
                  return (
                    <div key={p.productId} className="flex items-center gap-3">
                      <span className="w-5 text-center text-xs font-bold text-ink-mute">
                        {i + 1}
                      </span>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                          <p className="shrink-0 text-xs text-ink-soft">
                            {p.unitsSold} sold · {formatPrice(p.revenueCents, data.currency)}
                          </p>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-tint">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky to-mint-dark"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {data.totalOrders === 0 && (
            <div className="mt-6 rounded-2xl bg-slate-tint px-5 py-4 text-center text-sm text-ink-soft">
              No sales yet in this period. Data will appear as orders come in.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
