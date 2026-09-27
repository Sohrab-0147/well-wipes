import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Package, Truck, XCircle } from 'lucide-react';
import { adminOrderApi, type Order } from '@/api/orders';
import { formatPrice, cn } from '@/lib/utils';
import { toast } from '@/lib/toastStore';

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

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => adminOrderApi.list(0, 1000).then((page) => page.content.find((o) => o.id === id)!),
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => adminOrderApi.updateStatus(id!, status),
    onSuccess: (_, status) => {
      toast.success(`Order marked ${status.toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ['admin', 'order', id] });
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: () => toast.error('Could not update order status'),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-10 w-40 animate-pulse rounded-full bg-slate-tint" />
        <div className="h-64 animate-pulse rounded-3xl bg-slate-tint" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <p className="text-ink-soft">Order not found.</p>
        <Link to="/admin/orders" className="mt-4 inline-block font-semibold text-sky hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddress as Record<string, string>;
  const canMarkShipped = order.status === 'PAID';
  const canMarkDelivered = order.status === 'SHIPPED';
  const canCancel = ['PENDING', 'PAID'].includes(order.status);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/admin/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-sky"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-sky">Order</p>
          <h1 className="mt-2 font-mono text-3xl font-extrabold md:text-4xl">
            #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Placed{' '}
            {new Date(order.createdAt).toLocaleString('en-IN', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </p>
        </div>
        <span className={cn('rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider', statusClass(order.status))}>
          {order.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Items */}
          <div className="rounded-3xl border border-line bg-paper p-6 shadow-soft">
            <h2 className="text-lg font-bold">Items</h2>
            <div className="mt-5 divide-y divide-line">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-ink">{item.name}</p>
                    <p className="mt-1 text-xs text-ink-mute">
                      SKU: {item.sku} · {formatPrice(item.unitPriceCents, order.currency)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-ink">
                    {formatPrice(item.subtotalCents, order.currency)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
              <span className="font-semibold text-ink-soft">Total</span>
              <span className="text-2xl font-bold text-ink">
                {formatPrice(order.totalCents, order.currency)}
              </span>
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-3xl border border-line bg-paper p-6 shadow-soft">
            <h2 className="text-lg font-bold">Shipping address</h2>
            <div className="mt-4 text-sm text-ink-soft">
              <p className="font-semibold text-ink">{addr.fullName}</p>
              {addr.phone && <p className="mt-1">{addr.phone}</p>}
              <p className="mt-3">{addr.line1}</p>
              {addr.line2 && <p>{addr.line2}</p>}
              <p>
                {addr.city}, {addr.state} {addr.pincode}
              </p>
              <p className="mt-1">{addr.country}</p>
            </div>
          </div>
        </div>

        {/* Actions sidebar */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-3xl border border-line bg-paper p-6 shadow-soft">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-mute">
              Actions
            </h2>

            <div className="mt-4 space-y-2">
              {canMarkShipped && (
                <button
                  onClick={() => updateStatus.mutate('SHIPPED')}
                  disabled={updateStatus.isPending}
                  className="btn-glow w-full text-sm"
                >
                  <Truck className="h-4 w-4" />
                  Mark as shipped
                </button>
              )}

              {canMarkDelivered && (
                <button
                  onClick={() => updateStatus.mutate('DELIVERED')}
                  disabled={updateStatus.isPending}
                  className="btn-glow w-full text-sm"
                >
                  <Check className="h-4 w-4" />
                  Mark as delivered
                </button>
              )}

              {canCancel && (
                <button
                  onClick={() => {
                    if (confirm('Cancel this order?')) updateStatus.mutate('CANCELLED');
                  }}
                  disabled={updateStatus.isPending}
                  className="btn w-full border border-clay/30 bg-clay-tint text-sm text-clay-dark hover:bg-clay hover:text-white"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel order
                </button>
              )}

              {!canMarkShipped && !canMarkDelivered && !canCancel && (
                <div className="rounded-2xl bg-slate-tint px-4 py-3 text-center">
                  <Package className="mx-auto h-5 w-5 text-ink-mute" />
                  <p className="mt-2 text-xs text-ink-soft">
                    No actions available for this status
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-line pt-5 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-ink-mute">Order ID</span>
                <span className="font-mono text-ink">{order.id.slice(0, 8)}</span>
              </div>
              {order.stripeSessionId && (
                <div className="flex justify-between py-1">
                  <span className="text-ink-mute">Stripe session</span>
                  <span className="font-mono text-ink">{order.stripeSessionId.slice(0, 14)}…</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-ink-mute">Customer ID</span>
                <span className="font-mono text-ink">{order.userId.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
