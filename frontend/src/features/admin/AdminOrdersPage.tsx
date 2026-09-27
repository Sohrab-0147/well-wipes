import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight, Receipt } from 'lucide-react';
import { adminOrderApi, type Order } from '@/api/orders';
import { formatPrice, cn } from '@/lib/utils';

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

const FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Paid', value: 'PAID' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export function AdminOrdersPage() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { status, page }],
    queryFn: () => adminOrderApi.list(page, 20, status),
  });

  const handleFilter = (v: string | undefined) => {
    setStatus(v);
    setPage(0);
  };

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow text-sky">Orders</p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">All orders</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {data?.totalElements ?? 0} total orders
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => handleFilter(f.value)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              status === f.value
                ? 'bg-ink text-white'
                : 'bg-paper text-ink-soft hover:bg-slate-tint'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-line bg-paper shadow-soft">
        {isLoading && (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-tint" />
            ))}
          </div>
        )}

        {!isLoading && data && data.content.length === 0 && (
          <div className="p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-tint">
              <Receipt className="h-6 w-6 text-sky" />
            </div>
            <p className="mt-4 text-sm font-semibold text-ink">No orders here</p>
            <p className="mt-1 text-xs text-ink-soft">
              {status ? 'Try a different filter.' : 'Orders will show up here once customers buy.'}
            </p>
          </div>
        )}

        {!isLoading && data && data.content.length > 0 && (
          <>
            <div className="hidden grid-cols-12 gap-4 border-b border-line px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-mute md:grid">
              <div className="col-span-2">Order</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Items</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-line">
              {data.content.map((order) => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="grid grid-cols-1 gap-3 px-6 py-4 transition-colors hover:bg-slate-tint/40 md:grid-cols-12 md:items-center md:gap-4"
                >
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-ink">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <span className={cn('mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', statusClass(order.status))}>
                      {order.status}
                    </span>
                  </div>

                  <div className="text-sm text-ink-soft md:col-span-3">
                    {(order.shippingAddress as Record<string, string>)?.fullName ?? '—'}
                    <p className="text-xs text-ink-mute">
                      {(order.shippingAddress as Record<string, string>)?.city ?? ''}{' '}
                      {(order.shippingAddress as Record<string, string>)?.pincode ?? ''}
                    </p>
                  </div>

                  <div className="text-sm text-ink-soft md:col-span-2">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>

                  <div className="text-sm text-ink-soft md:col-span-2">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </div>

                  <div className="text-sm font-bold text-ink md:col-span-2 md:text-right">
                    {formatPrice(order.totalCents, order.currency)}
                  </div>

                  <div className="hidden justify-end md:col-span-1 md:flex">
                    <ChevronRight className="h-4 w-4 text-ink-mute" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-6 py-4">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="btn-secondary text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-ink-mute">
              Page {page + 1} of {data.totalPages}
            </span>
            <button
              disabled={page >= data.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
