import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="text-ink-mute transition-colors hover:text-sky"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-ink' : 'text-ink-mute'}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="h-3 w-3 text-ink-mute" />}
          </span>
        );
      })}
    </nav>
  );
}
