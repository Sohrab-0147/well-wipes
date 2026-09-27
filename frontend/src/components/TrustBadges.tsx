import { Lock, RefreshCw, ShieldCheck, Truck } from 'lucide-react';

const badges = [
  { icon: Lock, label: 'Secure payment' },
  { icon: Truck, label: 'Ships in 24h' },
  { icon: RefreshCw, label: '30-day returns' },
  { icon: ShieldCheck, label: 'Trusted seller' },
];

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {badges.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-line bg-slate-tint px-3 py-4 text-center"
        >
          <Icon className="h-4 w-4 text-sky" strokeWidth={1.8} />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
