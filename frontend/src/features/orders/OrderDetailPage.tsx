import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, MapPin } from 'lucide-react';
import { orderApi, type Order } from '@/api/orders';
import { apiClient } from '@/api/client';
import { formatPrice, cn } from '@/lib/utils';
import { toast } from '@/lib/toastStore';
import { OrderTimeline } from './OrderTimeline';

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

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.get(id!),
    enabled: !!id,
  });

  const downloadInvoice = async () => {
    if (!order) return;
    try {
      // Uses the axios client so the JWT interceptor auto-refreshes
      // an expired access token before hitting the endpoint.
      const res = await apiClient.get(
        `/api/v1/orders/${order.id}/invoice`,
        { responseType: 'blob' }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch (e: unknown) {
      console.error(e);
      const status =
        (e as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        toast.error('Invoice not available for this order');
      } else if (status === 401 || status === 403) {
        toast.error('Session expired', {
          description: 'Please sign in again and retry.',
        });
      } else {
        toast.error('Could not download invoice', {
          description: 'Please try again in a moment.',
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="page-container py-16">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="h-32 animate-pulse rounded-4xl bg-slate-soft" />
          <div className="h-64 animate-pulse rounded-4xl bg-slate-soft" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-container py-24 text-center">
        <p className="text-ink-soft">Order not found.</p>
        <Link to="/orders" className="mt-4 inline-block font-semibold text-sky hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddress as Record<string, string>;

  return (
    <div className="page-container py-12 md:py-16">
      <Link
        to="/orders"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-sky"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold md:text-4xl">
            Order #{order.id.slice(0, 8)}
          </h1>
          <span className={cn('rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider', statusClass(order.status))}>
            {order.status}
          </span>
          <button onClick={downloadInvoice} className="btn-secondary text-xs">
            <Download className="h-3.5 w-3.5" />
            Invoice
          </button>
        </div>

        <p className="mt-2 text-sm text-ink-mute">
          Placed on{' '}
          {new Date(order.createdAt).toLocaleString('en-IN', {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
        </p>

        <div className="mt-10 space-y-6">
          <OrderTimeline order={order} />

          {/* Items */}
          <div className="rounded-4xl border border-line bg-paper p-6 shadow-soft md:p-8">
            <h2 className="text-lg font-bold">Items</h2>
            <div className="mt-6 divide-y divide-line">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-ink">{item.name}</p>
                    <p className="mt-1 text-xs text-ink-mute">
                      SKU: {item.sku} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-ink">
                    {formatPrice(item.subtotalCents, order.currency)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-baseline justify-between border-t border-line pt-6">
              <span className="font-semibold text-ink-soft">Total paid</span>
              <span className="text-2xl font-bold text-ink">
                {formatPrice(order.totalCents, order.currency)}
              </span>
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-4xl border border-line bg-paper p-6 shadow-soft md:p-8">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-sky" />
              <h2 className="text-lg font-bold">Shipping to</h2>
            </div>
            <div className="mt-5 text-sm text-ink-soft">
              <p className="font-semibold text-ink">{addr.fullName}</p>
              {addr.phone && <p className="mt-1">{addr.phone}</p>}
              <p className="mt-2">{addr.line1}</p>
              {addr.line2 && <p>{addr.line2}</p>}
              <p>
                {addr.city}, {addr.state} {addr.pincode}
              </p>
              <p className="mt-1">{addr.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
