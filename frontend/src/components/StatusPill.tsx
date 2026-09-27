import { cn } from '@/lib/utils';

type OrderStatus =
  | 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'
  | 'EXPIRED' | 'SHIPPED' | 'DELIVERED';

export function statusColor(status: OrderStatus) {
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

export function StatusPill({
  status,
  size = 'md',
}: {
  status: OrderStatus;
  size?: 'sm' | 'md';
}) {
  return (
    <span
      className={cn(
        'inline-block rounded-full font-bold uppercase tracking-wider',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
        statusColor(status)
      )}
    >
      {status}
    </span>
  );
}
