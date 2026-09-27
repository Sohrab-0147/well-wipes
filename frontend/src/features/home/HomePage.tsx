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
  { slug: 'facial-tissue', name: 'Facial Tissue', tagline: '2-ply, ultra-soft, gentle on skin', icon: Wind, tint: 'from-sky-tint to-mint-tint', iconColor: 'text-sky' },
  { slug: 'kitchen-roll', name: 'Kitchen Roll', tagline: 'Absorbent, tear-resistant, 2 rolls', icon: Utensils, tint: 'from-mint-tint to-sky-tint', iconColor: 'text-mint-dark' },
  { slug: 'toilet-paper', name: 'Toilet Paper', tagline: '3-ply comfort, soft on every use', icon: Droplets, tint: 'from-sky-tint to-clay-tint', iconColor: 'text-sky' },
  { slug: 'wet-wipes', name: 'Wet Wipes', tagline: 'Gentle, moist, alcohol-free', icon: Baby, tint: 'from-clay-tint to-sky-tint', iconColor: 'text-clay' },
  { slug: 'napkins', name: 'Napkins', tagline: 'Elegant, sturdy, for every table', icon: Heart, tint: 'from-mint-tint to-clay-tint', iconColor: 'text-mint-dark' },
];

const HERO_IMAGE = 'https://images.pexels.com/photos/38357014/pexels-photo-38357014.jpeg?auto=compress&cs=tinysrgb&w=1200';

const INITIAL_COUNT = 8;
const PAGE_SIZE = 8;

export function HomePage() {
  useScrollReveal();

  // Progressive product loading
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
    // Ask for the next batch
    setCount((c) => c + PAGE_SIZE);
    // Reset the flag once the query resolves
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
                all made from 100% recycled pulp. Ultra-soft on skin, tough on messes,
                kinder to the planet.
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
                  <p className="mt-1 text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                    happy homes
                  </p>
                </div>
                <div className="h-8 w-px bg-line" />
                <div>
                  <p className="text-2xl font-bold tracking-tight text-ink">4.8★</p>
                  <p className="mt-1 text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                    average rating
                  </p>
                </div>
                <div className="h-8 w-px bg-line" />
                <div>
                  <p className="text-2xl font-bold tracking-tight text-ink">100%</p>
                  <p className="mt-1 text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                    recycled
                  </p>
                </div>
              </div>
            </div>

            {/* Hero visual — photo card with WW badge floating on top */}
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
                  Coimbatore made
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TRUST BAR ═══════════════ */}
      <section className="border-y border-line bg-slate-tint">
        <div className="page-container grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {trustItems.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint-tint text-mint-dark">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <span className="text-sm font-medium text-ink-soft">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ ALL PRODUCTS (progressive load) ═══════════════ */}
      <section className="bg-slate-tint">
        <div className="page-container section-pad">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-sky">Shop our range</p>
              <h2 className="mt-3 heading-section">
                Loved by thousands
                <br />
                of Indian homes
              </h2>
              {totalAvailable > 0 && (
                <p className="mt-3 text-sm text-ink-soft">
                  Showing {loadedCount} of {totalAvailable} product{totalAvailable !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <Link
              to="/products"
              className="hidden items-center gap-1 text-sm font-semibold text-sky hover:text-sky-dark sm:inline-flex"
            >
              View full shop
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {products.isLoading && (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
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
              <p className="mt-4 text-sm font-medium text-ink-soft">
                No products yet.
              </p>
            </div>
          )}

          {products.data && products.data.content.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {products.data.content.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Show more / View all */}
              <div className="mt-12 flex flex-col items-center gap-3">
                {hasMore ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <p className="text-xs font-medium uppercase tracking-wider text-ink-mute">
                      You've seen the entire range
                    </p>
                    <Link to="/products" className="btn-glow">
                      Open full shop with filters
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ═══════════════ SHOP BY TISSUE TYPE ═══════════════ */}
      <section className="page-container section-pad">
        <div className="reveal mb-12 text-center">
          <p className="eyebrow text-sky">What we make</p>
          <h2 className="mt-3 heading-section">
            Every kind of tissue,
            <br />
            for every room in your home.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-soft">
            From soft facial tissue for sensitive skin, to tough kitchen roll for spills —
            we make all of it. Pick your type below.
          </p>
        </div>

        <div className="reveal grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TISSUE_RANGES.map((range) => {
            const Icon = range.icon;
            return (
              <Link
                key={range.slug}
                to={`/products?category=${range.slug}`}
                className="group relative overflow-hidden rounded-4xl border border-line bg-paper p-6 transition-all duration-300 hover:border-sky/40 hover:shadow-lift"
              >
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${range.tint}`}>
                  <Icon className={`h-6 w-6 ${range.iconColor}`} strokeWidth={1.8} />
                </div>
                <h3 className="text-lg font-bold text-ink transition-colors group-hover:text-sky">
                  {range.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {range.tagline}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky opacity-0 transition-opacity group-hover:opacity-100">
                  Shop {range.name.toLowerCase()}
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}

          <Link
            to="/products"
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-4xl border-2 border-dashed border-line-strong bg-slate-tint p-6 text-center transition-all duration-300 hover:border-sky/60 hover:bg-sky-tint/30"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-paper shadow-soft">
              <Package className="h-6 w-6 text-sky" strokeWidth={1.8} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-ink transition-colors group-hover:text-sky">
              Browse everything
            </h3>
            <p className="mt-1.5 text-sm text-ink-soft">
              See all tissue products in one place
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky">
              Open the shop
              <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════════════ PROMISE ═══════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-60 glow-halo" />
        <div className="relative page-container section-pad">
          <div className="grid items-center gap-14 md:grid-cols-2">
            <div className="reveal relative">
              <div className="aspect-[4/3] overflow-hidden rounded-5xl bg-gradient-to-tr from-sky-tint via-paper to-mint-tint shadow-soft">
                <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 shadow-soft backdrop-blur">
                    <Leaf className="h-9 w-9 text-mint-dark" strokeWidth={1.8} />
                  </div>
                  <p className="text-2xs font-semibold uppercase tracking-[0.2em] text-ink-mute">
                    100% Recycled · Zero Plastic
                  </p>
                </div>
              </div>
            </div>

            <div className="reveal">
              <p className="eyebrow text-sky">Our promise</p>
              <h2 className="mt-4 heading-section">
                Every sheet made
                <br />
                from recycled paper.
              </h2>
              <p className="mt-7 max-w-lg text-lg leading-relaxed text-ink-soft">
                Recycled pulp. No chlorine bleach. No plastic wrap.
                Every order ships in a compostable mailer. We make tissue the way we'd
                want it in our own home.
              </p>

              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
                <div>
                  <p className="text-3xl font-bold tracking-tight text-sky">100%</p>
                  <p className="mt-1 text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                    recycled pulp
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight text-sky">0%</p>
                  <p className="mt-1 text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                    plastic wrap
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight text-sky">24h</p>
                  <p className="mt-1 text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                    to ship
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOUNDER'S NOTE ═══════════════ */}
      <section className="bg-slate-tint section-pad">
        <div className="page-container">
          <div className="reveal mx-auto max-w-3xl">
            <div className="relative rounded-4xl border border-line bg-paper p-10 shadow-soft md:p-16">
              <div className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-clay text-white shadow-glow-clay">
                <Heart className="h-5 w-5" fill="currentColor" />
              </div>

              <p className="eyebrow text-clay">A note from us</p>

              <blockquote className="mt-6 text-xl leading-relaxed text-ink md:text-2xl">
                "We started Well-Wipes because we couldn't find tissue that was{' '}
                <span className="text-sky">soft enough for our kids</span>,{' '}
                <span className="text-sky">strong enough for real life</span>, and{' '}
                <span className="text-sky">honest about what's in it</span>.
                So we made it ourselves — and now we're shipping it from our little
                workshop in Coimbatore to homes across India."
              </blockquote>

              <div className="mt-10 flex items-center gap-4 border-t border-line pt-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-tint to-mint-tint">
                  <span className="text-lg font-bold text-sky">W</span>
                </div>
                <div>
                  <p className="font-hand text-3xl leading-none text-ink">Team Well-Wipes</p>
                  <p className="mt-1 text-2xs font-semibold uppercase tracking-wider text-ink-mute">
                    Founders, Coimbatore
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="page-container section-pad">
        <div className="reveal relative overflow-hidden rounded-5xl border border-line bg-gradient-to-br from-sky-tint via-paper to-mint-tint p-12 text-center md:p-20">
          <div className="absolute inset-0 opacity-40 glow-halo" />
          <div className="relative">
            <p className="eyebrow text-sky">Ready when you are</p>
            <h2 className="mt-4 heading-section">Stock up on softness.</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
              Free shipping over ₹499. Delivered in two days. Every sheet made the way
              we'd want it in our own home.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/products" className="btn-glow-lg">
                Shop all tissue products
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/ai" className="btn-secondary">
                Ask Abdul anything
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
