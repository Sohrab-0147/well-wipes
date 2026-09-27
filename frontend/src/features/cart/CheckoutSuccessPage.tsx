import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { orderApi, paymentApi, type Order } from '@/api/orders';
import { formatPrice } from '@/lib/utils';
import { usePageTitle } from '@/lib/usePageTitle';

export function CheckoutSuccessPage() {
  usePageTitle('Order confirmed');
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
        const result = await orderApi.get(orderId);
        // Only sync online orders — COD has no Stripe session
        if (result.paymentMethod === 'ONLINE') {
          try {
            await paymentApi.sync(orderId);
            const refreshed = await orderApi.get(orderId);
            setOrder(refreshed);
          } catch {
            setOrder(result);
          }
        } else {
          setOrder(result);
        }
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

  const firstName = String(order.shippingAddress.fullName ?? 'friend').split(' ')[0];

  return (
    <div className="page-container py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        {/* Animated success checkmark */}
        <div className="animate-pop-in mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-mint-tint shadow-glow">
          <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none">
            <path
              d="M5 12.5 L10 17.5 L19 7"
              stroke="#0d9488"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-check-draw"
            />
          </svg>
        </div>

        <p className="eyebrow mt-10 text-sky animate-fade-up animate-fade-up-delay-1">
          Order confirmed
        </p>
        <h1 className="mt-4 text-4xl font-extrabold md:text-5xl animate-fade-up animate-fade-up-delay-2">
          Thank you, {firstName}.
        </h1>
        <p className="mt-4 text-lg text-ink-soft animate-fade-up animate-fade-up-delay-3">
          {order.paymentMethod === 'COD'
            ? "We'll call you shortly to confirm your cash-on-delivery order."
            : "Your order is on its way. We'll email you the tracking details shortly."}
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-2xl rounded-4xl border border-line bg-paper p-8 shadow-soft md:p-10 animate-fade-up animate-fade-up-delay-3">
        <div className="flex items-center justify-between border-b border-line pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
              Order ID
            </p>
            <p className="mt-1 font-mono text-sm text-ink">{order.id.slice(0, 8)}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            order.status === 'PAID'
              ? 'bg-mint-tint text-mint-dark'
              : 'bg-sky-tint text-sky-dark'
          }`}>
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
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/products" className="btn-secondary flex-1">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
