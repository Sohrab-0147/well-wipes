import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, IndianRupee, Package, Receipt, TrendingUp } from 'lucide-react';
import { adminOrderApi, type Order } from '@/api/orders';
import { formatPrice } from '@/lib/utils';

function statusClass(status: Order['status']) {
  switch (status) {
    case 'PAID':
    case 'SHIPPED':
    case 'DELIVERED':
      return 'bg-mint-tint text-mint-dark';
    case 'PENDING':
      return 'bg-sky-tint text-sky-dark';
    case 'FAILED':
    case 'CANCELLED':
    case 'EXPIRED':
      return 'bg-clay-tint text-clay-dark';
    default:
      return 'bg-slate-tint text-ink-soft';
  }
}

export function AdminDashboard() {
  const stats = useQuery({ queryKey: ['admin', 'stats'], queryFn: adminOrderApi.stats });
  const recent = useQuery({
    queryKey: ['admin', 'orders', 'recent'],
    queryFn: () => adminOrderApi.list(0, 5),
  });

  const cards = [
    { label: 'Revenue', value: stats.data ? formatPrice(stats.data.revenueCents, stats.data.currency) : '—', icon: IndianRupee, tint: 'from-sky-tint to-mint-tint', iconColor: 'text-sky' },
    { label: 'Total orders', value: stats.data?.total ?? '—', icon: Receipt, tint: 'from-mint-tint to-sky-tint', iconColor: 'text-mint-dark' },
    { label: 'Paid orders', value: stats.data?.paid ?? '—', icon: TrendingUp, tint: 'from-sky-tint to-paper', iconColor: 'text-sky' },
    { label: 'Pending', value: stats.data?.pending ?? '—', icon: Package, tint: 'from-clay-tint to-paper', iconColor: 'text-clay' },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow text-sky">Overview</p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Dashboard</h1>
        <p className="mt-2 text-sm text-ink-soft">A quick look at how Well-Wipes is doing today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tint, iconColor }) => (
          <div key={label} className="rounded-3xl border border-line bg-paper p-5 shadow-soft">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${tint}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.8} />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-mute">{label}</p>
            <p className="mt-1 text-2xl font-bold text-ink">{stats.isLoading ? '…' : value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-line bg-paper shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-ink">Recent orders</h2>
            <p className="mt-1 text-xs text-ink-mute">Latest 5 orders</p>
          </div>
          <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-sky hover:text-sky-dark">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recent.isLoading && (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-tint" />
            ))}
          </div>
        )}

        {recent.data && recent.data.content.length === 0 && (
          <div className="p-12 text-center"><p className="text-sm text-ink-soft">No orders yet.</p></div>
        )}

        {recent.data && recent.data.content.length > 0 && (
          <div className="divide-y divide-line">
            {recent.data.content.map((order) => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.id}`}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-tint/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-ink">#{order.id.slice(0, 8)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-ink-mute">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'} ·{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <p className="text-sm font-bold text-ink">{formatPrice(order.totalCents, order.currency)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
