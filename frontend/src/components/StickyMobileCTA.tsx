import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  name: string;
  priceCents: number;
  currency: string;
  onAdd: () => void;
  disabled?: boolean;
}

export function StickyMobileCTA({ name, priceCents, currency, onAdd, disabled }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur-md shadow-lift transition-transform duration-300 md:hidden',
        visible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-ink-soft">{name}</p>
          <p className="text-base font-bold text-ink">
            {formatPrice(priceCents, currency)}
          </p>
        </div>
        <button
          onClick={onAdd}
          disabled={disabled}
          className="btn-glow shrink-0 text-sm disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Add to cart
        </button>
      </div>
    </div>
  );
}
