import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Baby,
  Droplets,
  Heart,
  Leaf,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Utensils,
  Wind,
} from 'lucide-react';
import { productApi } from '@/api/products';
import { ProductCard } from '@/components/ProductCard';
import { LogoMark } from '@/components/Logo';
import { useScrollReveal } from '@/lib/useScrollReveal';

const trustItems = [
  { icon: Package, label: 'Free shipping over ₹499' },
  { icon: RefreshCw, label: 'Ships within 24 hours' },
  { icon: Leaf, label: '100% recycled pulp' },
  { icon: ShieldCheck, label: '30-day guarantee' },
];

const TISSUE_RANGES = [
  { slug: 'facial-tissue', name: 'Facial Tissue', tagline: '2-ply, ultra-soft', icon: Wind, tint: 'from-sky-tint to-mint-tint', iconColor: 'text-sky' },
  { slug: 'kitchen-roll', name: 'Kitchen Roll', tagline: 'Absorbent, tear-resistant', icon: Utensils, tint: 'from-mint-tint to-sky-tint', iconColor: 'text-mint-dark' },
  { slug: 'toilet-paper', name: 'Toilet Paper', tagline: '3-ply comfort', icon: Droplets, tint: 'from-sky-tint to-clay-tint', iconColor: 'text-sky' },
  { slug: 'wet-wipes', name: 'Wet Wipes', tagline: 'Gentle, moist, alcohol-free', icon: Baby, tint: 'from-clay-tint to-sky-tint', iconColor: 'text-clay' },
  { slug: 'napkins', name: 'Napkins', tagline: 'Elegant, sturdy', icon: Heart, tint: 'from-mint-tint to-clay-tint', iconColor: 'text-mint-dark' },
];

const HERO_IMAGE = '/promise.jpg';
const INITIAL_COUNT = 4;
const PAGE_SIZE = 4;

export function HomePage() {
  useScrollReveal();

  const [count, setCount] = useState(INITIAL_COUNT);
  const [loadingMore, setLoadingMore] = useState(false);

  const products = useQuery({
    queryKey: ['products', 'home', count],
    queryFn: () => productApi.list({ page: 0, size: count }),
  });

  const totalAvailable = products.data?.totalElements ?? 0;
  const loadedCount = products.data?.content.length ?? 0;
  const hasMore = loadedCount < totalAvailable;

  const handleShowMore = () => {
    setLoadingMore(true);
    setCount((c) => c + PAGE_SIZE);
    setTimeout(() => setLoadingMore(false), 600);
  };

  return (
    <div>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-sky-soft" />
        <div className="relative page-container">
          <div className="grid items-center gap-14 py-16 md:grid-cols-2 md:py-24">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky/20 bg-paper/80 px-3.5 py-1.5 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-sky" />
                <span className="text-2xs font-semibold uppercase tracking-wider text-sky">
                  India's softest tissue · Now delivering
                </span>
              </div>

              <h1 className="mt-6 heading-hero">
                Tissue paper,
                <br />
                <span className="text-sky">the way it should be.</span>
              </h1>

              <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-soft">
                Facial tissue, kitchen roll, toilet paper, wet wipes, and napkins —
                all made from 100% recycled pulp.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link to="/products" className="btn-glow-lg">
                  Shop all tissue products
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/about" className="btn-secondary">
                  Why we started
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-8 border-t border-line pt-6">
                <div>
                  <p className="text-2xl font-bold tracking-tight text-ink">12,000+</p>
                  <p className="mt-1 text-2xs font-semibold uppercase tracking-wider text-ink-mute">happy homes</p>
                </div>
                <div className="h-8 w-px bg-line" />
                <div>
                  <p className="text-2xl font-bold tracking-tight text-ink">4.8★</p>
                  <p className="mt-1 text-2xs font-semibold uppercase tracking-wider text-ink-mute">average rating</p>
                </div>
                <div className="h-8 w-px bg-line" />
                <div>
                  <p className="text-2xl font-bold tracking-tight text-ink">100%</p>
                  <p className="mt-1 text-2xs font-semibold uppercase tracking-wider text-ink-mute">recycled</p>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="absolute inset-10 rounded-full bg-sky/20 blur-3xl" />
              <div
                className="relative aspect-[5/6] overflow-hidden rounded-5xl shadow-glow"
                style={{
                  backgroundImage: `url(${HERO_IMAGE})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-ink/25 via-ink/15 to-ink/50" />

                <div className="relative flex h-full flex-col items-center justify-between p-8">
                  <div className="flex flex-1 items-center justify-center">
                    <LogoMark className="h-32 w-32 rounded-4xl shadow-lift md:h-40 md:w-40" />
                  </div>

                  <div className="w-full text-center">
                    <p className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
                      Well-Wipes
                    </p>
                    <p className="mt-1 text-2xs font-semibold uppercase tracking-[0.28em] text-white/80">
                      Everyday tissue paper
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-5 rounded-3xl border border-line bg-paper px-5 py-4 shadow-glow">
                <p className="text-2xs font-semibold uppercase tracking-widest text-ink-mute">
                  Since 2026
                </p>
                <p className="mt-0.5 text-lg font-bold tracking-tight text-ink">
                  Solapur made
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TRUST BAR ═══════════════ */}
      <section className="border-y border-line bg-slate-tint">
        <div className="page-container grid grid-cols-2 gap-6 py-6 md:grid-cols-4">
          {trustItems.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-tint text-mint-dark">
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <span className="text-xs font-medium text-ink-soft">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ CATEGORIES — compact strip ═══════════════ */}
      <section className="page-container section-pad-tight">
        <div className="reveal mb-8 text-center">
          <p className="eyebrow text-sky">What we make</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
            Every kind of tissue
          </h2>
        </div>

        <div className="reveal grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TISSUE_RANGES.map((range) => {
            const Icon = range.icon;
            return (
              <Link
                key={range.slug}
                to={`/products?category=${range.slug}`}
                className="group flex flex-col items-center gap-3 rounded-3xl border border-line bg-paper p-5 text-center transition-all duration-300 hover:border-sky/40 hover:shadow-soft"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${range.tint}`}>
                  <Icon className={`h-5 w-5 ${range.iconColor}`} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink transition-colors group-hover:text-sky">
                    {range.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-mute">{range.tagline}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════════ PRODUCTS ═══════════════ */}
      <section className="bg-slate-tint">
        <div className="page-container section-pad">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-sky">Shop our range</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
                Loved by thousands
              </h2>
              {totalAvailable > 0 && (
                <p className="mt-2 text-xs text-ink-soft">
                  Showing {loadedCount} of {totalAvailable} product{totalAvailable !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-sm font-semibold text-sky hover:text-sky-dark"
            >
              View full shop
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {products.isLoading && (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {Array.from({ length: INITIAL_COUNT }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-3xl bg-paper" />
                  <div className="mt-4 h-4 w-3/4 rounded-full bg-paper" />
                  <div className="mt-2 h-4 w-1/2 rounded-full bg-paper" />
                </div>
              ))}
            </div>
          )}

          {products.data && products.data.content.length === 0 && (
            <div className="rounded-3xl border border-line bg-paper p-16 text-center">
              <Package className="mx-auto h-8 w-8 text-ink-mute" />
              <p className="mt-4 text-sm font-medium text-ink-soft">No products yet.</p>
            </div>
          )}

          {products.data && products.data.content.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {products.data.content.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-10 flex flex-col items-center gap-2">
                  <button
                    onClick={handleShowMore}
                    disabled={loadingMore || products.isFetching}
                    className="btn-secondary"
                  >
                    {products.isFetching ? 'Loading…' : 'Show more products'}
                    <ArrowRight className="h-4 w-4 rotate-90" />
                  </button>
                  <p className="text-xs text-ink-mute">
                    {totalAvailable - loadedCount} more to load
                  </p>
                </div>
              )}

              {!hasMore && (
                <div className="mt-10 text-center">
                  <Link to="/products" className="btn-glow">
                    Open full shop with filters
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ═══════════════ PROMISE — compact ═══════════════ */}
      <section className="page-container section-pad">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="reveal relative">
            <div className="aspect-[4/3] overflow-hidden rounded-5xl shadow-soft">
              <img
                src="/promise.jpg"
                alt="Recycled paper texture"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-2xl bg-paper/90 px-4 py-3 shadow-lift backdrop-blur">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-mint-tint">
                  <Leaf className="h-4 w-4 text-mint-dark" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                    Made from
                  </p>
                  <p className="text-sm font-bold text-ink">100% recycled paper</p>
                </div>
              </div>
            </div>
          </div>

          <div className="reveal">
            <p className="eyebrow text-sky">Our promise</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight md:text-4xl">
              Paper shouldn't
              <br />
              cost the earth.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
              Recycled pulp. No chlorine bleach. No plastic wrap. Every order ships
              in a compostable mailer.
            </p>

            <div className="mt-8 flex gap-8 border-t border-line pt-6">
              <div>
                <p className="text-2xl font-bold tracking-tight text-sky">100%</p>
                <p className="mt-1 text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                  recycled
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-sky">0%</p>
                <p className="mt-1 text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                  plastic
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-sky">24h</p>
                <p className="mt-1 text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                  to ship
                </p>
              </div>
            </div>

            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-sky hover:text-sky-dark"
            >
              Read our full story
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
