import { useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { toast } from '@/lib/toastStore';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    // TODO: replace with real signup endpoint later
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('ww-newsletter') ?? '[]');
      if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem('ww-newsletter', JSON.stringify(existing));
      }
    } catch { /* ignore */ }
    setDone(true);
    toast.success('Thanks for subscribing!', {
      description: 'Look out for a 10% off coupon in your inbox.',
    });
  };

  return (
    <div className="rounded-3xl border border-line bg-paper p-6">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-sky" />
        <p className="text-sm font-bold text-ink">Get 10% off your first order</p>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-soft">
        Subscribe for occasional updates, restock alerts, and exclusive offers. No spam, ever.
      </p>

      {done ? (
        <div className="mt-4 rounded-full bg-mint-tint px-4 py-2.5 text-center text-xs font-semibold text-mint-dark">
          You're on the list ✓
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input py-2.5 text-xs"
            required
          />
          <button
            type="submit"
            className="flex h-10 shrink-0 items-center justify-center rounded-full bg-sky px-4 text-white transition-colors hover:bg-sky-dark"
            aria-label="Subscribe"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}
