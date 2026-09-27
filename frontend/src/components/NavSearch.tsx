import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, X } from 'lucide-react';
import { productApi } from '@/api/products';
import { formatPrice, cn } from '@/lib/utils';

export function NavSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => setHighlightedIndex(-1), [debounced]);

  useEffect(() => {
    if (autoFocus) setTimeout(() => inputRef.current?.focus(), 50);
  }, [autoFocus]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ['nav-search', debounced],
    queryFn: () => productApi.list({ q: debounced, page: 0, size: 6 }),
    enabled: debounced.length >= 2,
    staleTime: 15_000,
  });

  const results = data?.content ?? [];

  const goToAll = (q: string) => {
    if (!q.trim()) return;
    navigate(`/products?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const goToProduct = (slug: string) => {
    navigate(`/products/${slug}`);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlightedIndex((i) => Math.min(i + 1, results.length));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        goToProduct(results[highlightedIndex].slug);
      } else {
        goToAll(query);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products…"
          className="input h-10 py-0 pl-11 pr-10 text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-mute transition-colors hover:bg-slate-tint hover:text-ink"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && debounced.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-3xl border border-line bg-paper shadow-lift">
          {isFetching && results.length === 0 && (
            <div className="flex items-center gap-3 px-5 py-4 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </div>
          )}

          {!isFetching && results.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-ink-soft">No products found.</p>
              <p className="mt-1 text-xs text-ink-mute">Try a different word.</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className="max-h-[400px] overflow-y-auto">
                {results.map((p, i) => (
                  <button
                    key={p.id}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    onClick={() => goToProduct(p.slug)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                      highlightedIndex === i ? 'bg-sky-tint/40' : 'hover:bg-slate-tint'
                    )}
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-tint">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-ink-mute">
                          —
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-mute">{p.sku}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-ink">
                      {formatPrice(p.priceCents, p.currency)}
                    </p>
                  </button>
                ))}
              </div>

              <button
                onMouseEnter={() => setHighlightedIndex(results.length)}
                onClick={() => goToAll(query)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 border-t border-line px-4 py-3 text-left transition-colors',
                  highlightedIndex === results.length ? 'bg-sky-tint/40' : 'hover:bg-slate-tint'
                )}
              >
                <span className="truncate text-sm font-medium text-sky">
                  See all results for "{query}"
                </span>
                <span className="shrink-0 text-xs text-ink-mute">↵</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
