import { Check, Package, Truck, Home, CreditCard, XCircle } from 'lucide-react';
import type { Order } from '@/api/orders';
import { cn } from '@/lib/utils';

type StepState = 'done' | 'current' | 'pending' | 'failed';

interface Step {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  state: StepState;
  timestamp?: string | null;
}

function buildSteps(order: Order): Step[] {
  const isCOD = order.paymentMethod === 'COD';
  const isTerminal = ['CANCELLED', 'FAILED', 'EXPIRED'].includes(order.status);

  // For COD: Placed → Shipped → Delivered
  // For ONLINE: Placed → Paid → Shipped → Delivered
  const stages = isCOD
    ? [
        { key: 'placed', label: 'Order placed', description: 'We received your order', icon: Package },
        { key: 'shipped', label: 'Shipped', description: 'On its way to you', icon: Truck },
        { key: 'delivered', label: 'Delivered', description: 'Cash collected on delivery', icon: Home },
      ]
    : [
        { key: 'placed', label: 'Order placed', description: 'We received your order', icon: Package },
        { key: 'paid', label: 'Payment confirmed', description: 'Payment received successfully', icon: CreditCard },
        { key: 'shipped', label: 'Shipped', description: 'On its way to you', icon: Truck },
        { key: 'delivered', label: 'Delivered', description: 'Enjoy your Well-Wipes', icon: Home },
      ];

  // Determine current index from status
  const currentIndex = (() => {
    switch (order.status) {
      case 'PENDING': return 0;
      case 'PAID': return isCOD ? 0 : 1;
      case 'SHIPPED': return isCOD ? 1 : 2;
      case 'DELIVERED': return stages.length - 1;
      default: return 0;
    }
  })();

  return stages.map((s, i) => {
    let state: StepState;
    if (isTerminal && i === 0) {
      state = 'failed';
    } else if (i < currentIndex) {
      state = 'done';
    } else if (i === currentIndex) {
      state = order.status === 'DELIVERED' ? 'done' : 'current';
    } else {
      state = 'pending';
    }
    return { ...s, state };
  });
}

export function OrderTimeline({ order }: { order: Order }) {
  const steps = buildSteps(order);
  const isTerminal = ['CANCELLED', 'FAILED', 'EXPIRED'].includes(order.status);

  return (
    <div className="rounded-3xl border border-line bg-paper p-6 shadow-soft md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Order tracking</h2>
        {isTerminal && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-clay-tint px-3 py-1 text-xs font-semibold text-clay-dark">
            <XCircle className="h-3.5 w-3.5" />
            {order.status}
          </span>
        )}
      </div>

      {isTerminal ? (
        <div className="rounded-2xl bg-clay-tint/60 px-5 py-4 text-sm text-clay-dark">
          {order.status === 'CANCELLED' && 'This order was cancelled.'}
          {order.status === 'FAILED' && 'Payment for this order could not be completed.'}
          {order.status === 'EXPIRED' && 'This order expired before payment was completed.'}
        </div>
      ) : (
        <>
          {/* Desktop: horizontal timeline */}
          <div className="hidden md:block">
            <div className="relative flex items-start justify-between">
              {/* Progress line behind the icons */}
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-line" />
              <div
                className="absolute left-0 top-5 h-0.5 bg-sky transition-all duration-700"
                style={{
                  width: `${(steps.findIndex((s) => s.state === 'current') / Math.max(1, steps.length - 1)) * 100}%`,
                }}
              />

              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.key} className="relative z-10 flex flex-1 flex-col items-center">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                        step.state === 'done' && 'border-sky bg-sky text-white',
                        step.state === 'current' && 'border-sky bg-white text-sky shadow-glow-sm',
                        step.state === 'pending' && 'border-line bg-white text-ink-mute'
                      )}
                    >
                      {step.state === 'done' ? (
                        <Check className="h-5 w-5" strokeWidth={2.5} />
                      ) : (
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                      )}
                    </div>
                    <p
                      className={cn(
                        'mt-3 text-sm font-semibold',
                        step.state === 'pending' ? 'text-ink-mute' : 'text-ink'
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="mt-0.5 max-w-[150px] text-center text-xs text-ink-soft">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: vertical timeline */}
          <div className="md:hidden">
            <div className="relative space-y-6">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const isLast = i === steps.length - 1;
                return (
                  <div key={step.key} className="relative flex gap-4">
                    {/* Line below */}
                    {!isLast && (
                      <div
                        className={cn(
                          'absolute left-5 top-10 h-full w-0.5',
                          step.state === 'done' ? 'bg-sky' : 'bg-line'
                        )}
                      />
                    )}

                    <div
                      className={cn(
                        'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
                        step.state === 'done' && 'border-sky bg-sky text-white',
                        step.state === 'current' && 'border-sky bg-white text-sky shadow-glow-sm',
                        step.state === 'pending' && 'border-line bg-white text-ink-mute'
                      )}
                    >
                      {step.state === 'done' ? (
                        <Check className="h-5 w-5" strokeWidth={2.5} />
                      ) : (
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                      )}
                    </div>

                    <div className="pt-1.5">
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          step.state === 'pending' ? 'text-ink-mute' : 'text-ink'
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-soft">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping address reminder */}
          <div className="mt-8 rounded-2xl bg-slate-tint px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
              Shipping to
            </p>
            <p className="mt-1.5 text-sm text-ink">
              {String((order.shippingAddress as Record<string, string>).fullName ?? '')} ·{' '}
              {String((order.shippingAddress as Record<string, string>).city ?? '')}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
