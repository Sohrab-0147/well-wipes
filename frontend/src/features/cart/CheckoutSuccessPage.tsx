import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { orderApi, paymentApi, type Order } from '@/api/orders';
import { formatPrice } from '@/lib/utils';

export function CheckoutSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    const orderId = sessionStorage.getItem('ww_pending_order_id');
    if (!orderId) {
      setState('error');
      return;
    }

    const run = async () => {
      try {
        // Reconcile the payment (in case webhook was missed)
        try {
          await paymentApi.sync(orderId);
        } catch {
          // Sync is best-effort — continue
        }

        const result = await orderApi.get(orderId);
        setOrder(result);
        setState('done');
        sessionStorage.removeItem('ww_pending_order_id');
      } catch {
        setState('error');
      }
    };

    run();
  }, [sessionId]);

  if (state === 'loading') {
    return (
      <div className="page-container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky" />
        <p className="mt-6 text-ink-soft">Confirming your order…</p>
      </div>
    );
  }

  if (state === 'error' || !order) {
    return (
      <div className="page-container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="text-3xl font-extrabold">We couldn't find that order</h1>
        <p className="mt-3 text-ink-soft">
          If you were charged, your order is safe. Contact us and we'll sort it out.
        </p>
        <Link to="/products" className="btn-glow mt-8">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container py-16 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mint-tint">
          <Check className="h-10 w-10 text-mint-dark" strokeWidth={2.5} />
        </div>

        <p className="eyebrow mt-8 text-sky">Order confirmed</p>
        <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">
          Thank you, {order.shippingAddress.fullName ? String(order.shippingAddress.fullName).split(' ')[0] : 'friend'}.
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          Your order is on its way. We'll email you the tracking details shortly.
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-2xl rounded-4xl border border-line bg-paper p-8 shadow-soft md:p-10">
        <div className="flex items-center justify-between border-b border-line pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
              Order ID
            </p>
            <p className="mt-1 font-mono text-sm text-ink">{order.id.slice(0, 8)}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              order.status === 'PAID'
                ? 'bg-mint-tint text-mint-dark'
                : 'bg-sky-tint text-sky-dark'
            }`}
          >
            {order.status}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 text-sm">
              <span className="text-ink-soft">
                {item.name}
                <span className="ml-1 text-ink-mute">× {item.quantity}</span>
              </span>
              <span className="font-semibold text-ink">
                {formatPrice(item.subtotalCents, order.currency)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-baseline justify-between border-t border-line pt-6">
          <span className="font-semibold text-ink-soft">Total</span>
          <span className="text-2xl font-bold text-ink">
            {formatPrice(order.totalCents, order.currency)}
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/orders" className="btn-glow flex-1">
            View my orders
          </Link>
          <Link to="/products" className="btn-secondary flex-1">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
