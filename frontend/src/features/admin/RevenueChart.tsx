import { useMemo, useState } from 'react';
import type { DailyRevenue } from '@/api/orders';
import { formatPrice } from '@/lib/utils';

export function RevenueChart({
  data,
  currency,
}: {
  data: DailyRevenue[];
  currency: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { path, areaPath, points } = useMemo(() => {
    const values = data.map((d) => d.revenueCents);
    const max = Math.max(...values, 1);

    const width = 800;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 20, left: 20 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const pts = data.map((d, i) => {
      const x = padding.left + (i / Math.max(1, data.length - 1)) * chartW;
      const y = padding.top + chartH - (d.revenueCents / max) * chartH;
      return { x, y, ...d };
    });

    let p = '';
    if (pts.length > 0) {
      p = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const midX = (prev.x + curr.x) / 2;
        p += ` Q ${prev.x} ${prev.y} ${midX} ${(prev.y + curr.y) / 2}`;
        p += ` Q ${curr.x} ${curr.y} ${curr.x} ${curr.y}`;
      }
    }

    const area = p + ` L ${pts[pts.length - 1]?.x ?? 0} ${padding.top + chartH} L ${pts[0]?.x ?? 0} ${padding.top + chartH} Z`;

    return { path: p, areaPath: area, points: pts };
  }, [data]);

  const hovered = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="relative">
      <svg viewBox="0 0 800 200" className="w-full" style={{ height: 240 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = 20 + (1 - t) * 160;
          return (
            <line
              key={t}
              x1="20"
              x2="780"
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}

        {points.length > 1 && <path d={areaPath} fill="url(#revFill)" />}

        {points.length > 1 && (
          <path
            d={path}
            fill="none"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIndex === i ? 5 : 0}
              fill="#0284c7"
              stroke="white"
              strokeWidth="2"
              style={{ transition: 'r 150ms ease' }}
            />
            <rect
              x={pt.x - 10}
              y={0}
              width={20}
              height={200}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'crosshair' }}
            />
          </g>
        ))}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl border border-line bg-paper px-3 py-2 shadow-lift"
          style={{
            left: `${(hovered.x / 800) * 100}%`,
            top: 0,
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">
            {new Date(hovered.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
          </p>
          <p className="mt-0.5 text-sm font-bold text-ink">
            {formatPrice(hovered.revenueCents, currency)}
          </p>
          <p className="text-[10px] text-ink-soft">
            {hovered.orderCount} {hovered.orderCount === 1 ? 'order' : 'orders'}
          </p>
        </div>
      )}

      {points.length > 1 && (
        <div className="mt-2 flex justify-between px-5 text-[10px] font-medium uppercase tracking-wider text-ink-mute">
          <span>
            {new Date(points[0].date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
          <span>
            {new Date(points[Math.floor(points.length / 2)].date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
          <span>
            {new Date(points[points.length - 1].date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>
      )}
    </div>
  );
}
