import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Leaf, Package, Users } from 'lucide-react';
import { StackMark } from '@/components/ProductImage';
import { useScrollReveal } from '@/lib/useScrollReveal';

const values = [
  {
    icon: Leaf,
    title: 'Recycled, always',
    body: '100% recycled pulp, no chlorine bleach, no plastic wrap. Every order ships in a compostable mailer.',
  },
  {
    icon: Heart,
    title: 'Soft on purpose',
    body: 'We tested dozens of blends before finding one soft enough for a newborn and tough enough for a spill.',
  },
  {
    icon: Users,
    title: 'Small team, real people',
    body: 'We are four people in Coimbatore. Every order is packed by hand, by one of us.',
  },
  {
    icon: Package,
    title: 'Shipped honestly',
    body: 'Free shipping over ₹499. Two-day delivery across India. No hidden charges, ever.',
  },
];

export function AboutPage() {
  useScrollReveal();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-sky-soft" />
        <div className="relative page-container py-20 text-center md:py-28">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-4xl bg-sky text-white shadow-glow">
            <StackMark className="h-8 w-8" />
          </div>
          <p className="eyebrow mt-8 text-sky">Our story</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            We make tissue the way we'd want it in our own home.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Well-Wipes started in 2026 with a simple question: why does soft tissue
            have to come wrapped in plastic and cost the earth?
          </p>
        </div>
      </section>

      {/* Values grid */}
      <section className="page-container py-20 md:py-28">
        <div className="reveal mx-auto mb-14 max-w-2xl text-center">
          <p className="eyebrow text-sky">What we stand for</p>
          <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
            Four things we refuse to compromise on.
          </h2>
        </div>

        <div className="reveal grid gap-6 md:grid-cols-2">
          {values.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-4xl border border-line bg-paper p-8 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-tint to-mint-tint">
                <Icon className="h-6 w-6 text-sky" strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder note */}
      <section className="bg-slate-tint py-20 md:py-28">
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
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-mute">
                    Founders, Coimbatore
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="page-container py-20 md:py-28">
        <div className="reveal grid gap-6 rounded-4xl border border-line bg-gradient-to-br from-sky-tint/40 via-paper to-mint-tint/40 p-10 text-center md:grid-cols-3 md:p-14">
          <div>
            <p className="text-5xl font-extrabold text-sky">12,000+</p>
            <p className="mt-2 text-sm font-medium uppercase tracking-wider text-ink-mute">
              Happy homes
            </p>
          </div>
          <div className="md:border-x md:border-line">
            <p className="text-5xl font-extrabold text-sky">0%</p>
            <p className="mt-2 text-sm font-medium uppercase tracking-wider text-ink-mute">
              Plastic packaging
            </p>
          </div>
          <div>
            <p className="text-5xl font-extrabold text-sky">100%</p>
            <p className="mt-2 text-sm font-medium uppercase tracking-wider text-ink-mute">
              Recycled pulp
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-container pb-24 md:pb-32">
        <div className="reveal mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Ready to try us out?</h2>
          <p className="mt-4 text-lg text-ink-soft">
            Every order ships with a money-back guarantee. If you don't love it, we'll refund you.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/products" className="btn-glow-lg">
              Shop all products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/ai" className="btn-secondary">
              Ask Abdul anything
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
