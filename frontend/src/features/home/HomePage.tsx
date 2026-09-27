import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Heart,
  Leaf,
  Package,
  RefreshCw,
  ShieldCheck,
  Sparkles,
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

export function HomePage() {
  useScrollReveal();

  const featured = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productApi.list({ page: 0, size: 4 }),
  });

  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-sky-soft" />
        <div className="relative page-container">
          <div className="grid items-center gap-14 py-16 md:grid-cols-2 md:py-24">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky/20 bg-paper/80 px-3.5 py-1.5 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-sky" />
                <span className="text-xs font-semibold text-sky">
                  New — now shipping across India
                </span>
              </div>

              <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight text-ink md:text-7xl">
                Softness,
                <br />
                <span className="text-sky">by the sheet.</span>
              </h1>

              <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-soft">
                Gentle on skin. Tough on messes. Kinder to the planet.
                Because softness shouldn't cost the earth.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link to="/products" className="btn-glow-lg">
                  Shop all products
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/about" className="btn-secondary">
                  Read our story
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 border-t border-line pt-6">
                <div>
                  <p className="text-2xl font-bold text-ink">12,000+</p>
                  <p className="text-xs text-ink-mute">happy homes</p>
                </div>
                <div className="h-8 w-px bg-line" />
                <div>
                  <p className="text-2xl font-bold text-ink">4.8★</p>
                  <p className="text-xs text-ink-mute">average rating</p>
                </div>
                <div className="h-8 w-px bg-line" />
                <div>
                  <p className="text-2xl font-bold text-ink">100%</p>
                  <p className="text-xs text-ink-mute">recycled</p>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative animate-fade-in">
              <div className="absolute inset-10 rounded-full bg-sky/20 blur-3xl" />
              <div className="relative aspect-[5/6] overflow-hidden rounded-4xl bg-gradient-to-br from-sky-tint via-mint-tint to-slate-tint shadow-glow">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                  <div className="h-32 w-32 overflow-hidden rounded-4xl shadow-glow">
                    <LogoMark className="h-full w-full rounded-4xl" />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-ink">Well-Wipes</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-ink-mute">
                      Est. 2026
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-5 rounded-3xl border border-line bg-paper px-5 py-4 shadow-glow">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-mute">
                  Loved by
                </p>
                <p className="mt-0.5 text-lg font-bold text-ink">12,000+ homes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="border-y border-line bg-slate-tint">
        <div className="page-container grid grid-cols-2 gap-6 py-9 md:grid-cols-4">
          {trustItems.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mint-tint text-mint-dark">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-ink-soft">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED ─── */}
      <section className="page-container py-20 md:py-28">
        <div className="reveal mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-sky">Shop</p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-5xl">
              Everyday softness,
              <br />
              for every room
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden items-center gap-1 text-sm font-semibold text-sky hover:text-sky-dark sm:inline-flex"
          >
            See all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featured.isLoading && (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-3xl bg-slate-soft" />
                <div className="mt-4 h-4 w-3/4 rounded-full bg-slate-soft" />
                <div className="mt-2 h-4 w-1/2 rounded-full bg-slate-soft" />
              </div>
            ))}
          </div>
        )}

        {featured.data && (
          <div className="reveal grid grid-cols-2 gap-6 md:grid-cols-4">
            {featured.data.content.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ─── OUR PROMISE (light, replaces dark block) ─── */}
      <section className="relative overflow-hidden bg-slate-tint">
        <div className="absolute inset-0 opacity-60 glow-halo" />
        <div className="relative page-container py-20 md:py-28">
          <div className="grid items-center gap-14 md:grid-cols-2">
            <div className="reveal relative">
              <div className="aspect-[4/3] overflow-hidden rounded-4xl bg-gradient-to-tr from-sky-tint via-paper to-mint-tint shadow-soft">
                <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 shadow-soft backdrop-blur">
                    <Leaf className="h-9 w-9 text-mint-dark" />
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-mute">
                    Recycled · Plastic-free
                  </p>
                </div>
              </div>
            </div>

            <div className="reveal">
              <p className="eyebrow text-sky">Our promise</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
                Paper shouldn't
                <br />
                cost the earth.
              </h2>
              <p className="mt-7 max-w-lg text-lg leading-relaxed text-ink-soft">
                Recycled pulp. No chlorine bleach. No plastic wrap.
                Every order ships in a compostable mailer. That's the whole promise.
              </p>

              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
                <div>
                  <p className="text-3xl font-bold text-sky">100%</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-mute">
                    recycled pulp
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-sky">0%</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-mute">
                    plastic
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-sky">24h</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-mute">
                    to ship
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOUNDER'S NOTE (the human moment) ─── */}
      <section className="page-container py-20 md:py-28">
        <div className="reveal mx-auto max-w-3xl">
          <div className="relative rounded-4xl border border-line bg-paper p-10 shadow-soft md:p-16">
            {/* Corner accent */}
            <div className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-clay text-white shadow-glow-clay">
              <Heart className="h-5 w-5" fill="currentColor" />
            </div>

            <p className="eyebrow text-clay">A note from us</p>

            <blockquote className="mt-6 text-xl leading-relaxed text-ink md:text-2xl">
              "We started Well-Wipes because we couldn't find tissue that was
              <span className="text-sky"> soft enough for our kids</span>,
              <span className="text-sky"> strong enough for real life</span>, and
              <span className="text-sky"> honest about what's in it</span>.
              So we made it ourselves — and now we're shipping it from our little
              workshop in Coimbatore to homes across India."
            </blockquote>

            <div className="mt-10 flex items-center gap-4 border-t border-line pt-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-tint to-mint-tint">
                <span className="text-lg font-bold text-sky">W</span>
              </div>
              <div>
                <p className="font-hand text-3xl leading-none text-ink">Team Well-Wipes</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-mute">
                  Founders, Coimbatore
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="page-container pb-24 md:pb-32">
        <div className="reveal relative overflow-hidden rounded-4xl border border-line bg-gradient-to-br from-sky-tint via-paper to-mint-tint p-12 text-center md:p-20">
          <div className="absolute inset-0 opacity-40 glow-halo" />
          <div className="relative">
            <p className="eyebrow text-sky">Ready when you are</p>
            <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
              Stock up on softness.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
              Free shipping over ₹499. Delivered in two days. Every sheet made the way we'd want it in our own home.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/products" className="btn-glow-lg">
                Browse products
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
