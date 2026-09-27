import { usePageTitle } from '@/lib/usePageTitle';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { orderApi, type Order } from '@/api/orders';
import { EmptyState } from '@/components/EmptyState';
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

export function OrdersPage() {
  usePageTitle('My orders');
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.list(0, 20),
  });

  if (isLoading) {
    return (
      <div className="page-container py-16">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl bg-slate-soft" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="page-container py-16">
        <EmptyState
          title="No orders yet"
          description="When you place your first order, it'll show up here."
          ctaLabel="Start shopping"
          ctaHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="page-container py-12 md:py-16">
      <div className="mb-10">
        <p className="eyebrow text-sky">Account</p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">My orders</h1>
      </div>

      <div className="space-y-4">
        {data.content.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="card-soft flex items-center gap-6 p-5 transition-all duration-300 hover:border-sky/30 hover:shadow-soft"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusClass(order.status)}`}>
                  {order.status}
                </span>
                <span className="text-xs text-ink-mute">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="mt-2 font-semibold text-ink">
                Order #{order.id.slice(0, 8)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'} ·{' '}
                {order.items.map((i) => i.name).join(', ')}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-mute">
                {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Paid online'}
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-ink">
                {formatPrice(order.totalCents, order.currency)}
              </p>
              <ChevronRight className="ml-auto mt-1 h-4 w-4 text-ink-mute" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
