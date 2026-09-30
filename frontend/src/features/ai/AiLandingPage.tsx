import { usePageTitle } from '@/lib/usePageTitle';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, MessageCircle, Send, Sparkles } from 'lucide-react';
import { apiClient } from '@/api/client';
import { StackMark } from '@/components/ProductImage';
import { AbdulAvatar } from './AbdulAvatar';
import { cn } from '@/lib/utils';

interface Source {
  productId: string;
  sku: string;
  slug: string;
  name: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  error?: boolean;
}

interface AskResponse {
  question: string;
  answer: string;
  sources: Source[];
}

const SUGGESTIONS = [
  'Which tissue is best for sensitive skin?',
  "What's the difference between kitchen roll and facial tissue?",
  'Do you have anything for babies?',
  'Which products are eco-friendly?',
  'What is the ply count in your facial tissue?',
  'Which is your softest product?',
];

export function AiLandingPage() {
  usePageTitle('Ask Abdul');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'user', content: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post<AskResponse>('/v1/ai/ask', { question: trimmed });
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: res.data.answer,
          sources: res.data.sources,
        },
      ]);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Something went wrong. Please try again.';
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'assistant', content: msg, error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-sky-soft" />
        <div className="relative page-container py-20 text-center md:py-24">
          <div className="mx-auto h-20 w-20 overflow-hidden rounded-4xl shadow-glow">
            <AbdulAvatar className="h-full w-full rounded-4xl" />
          </div>
          <p className="eyebrow mt-8 text-sky">Meet Abdul</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            Hi, I'm Abdul.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Abdul knows every product in the Well-Wipes catalog. Ask about softness, ingredients, ply count, or which tissue is best for your home.
          </p>
        </div>
      </section>

      {/* Chat panel */}
      <section className="page-container py-16 md:py-20">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-4xl border border-line bg-paper shadow-lift">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-line bg-gradient-to-r from-sky-tint via-paper to-mint-tint px-6 py-5">
            <AbdulAvatar className="h-11 w-11" />
            <div className="flex-1">
              <p className="font-bold text-ink">Abdul · Well-Wipes</p>
              <p className="text-xs text-ink-soft">
                <Sparkles className="mr-1 inline h-3 w-3" />
                Your Well-Wipes assistant
              </p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-mute transition-colors hover:bg-paper/60 hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="min-h-[400px] space-y-6 overflow-y-auto px-6 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-tint to-mint-tint">
                    <MessageCircle className="h-6 w-6 text-sky" />
                  </div>
                  <p className="mt-4 font-semibold text-ink">Ask Abdul anything. Try one of these:</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-2xl border border-line bg-paper px-5 py-4 text-left text-sm text-ink-soft transition-all duration-200 hover:border-sky/40 hover:bg-sky-tint/30 hover:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => <Bubble key={msg.id} message={msg} />)
            )}

            {loading && (
              <div className="flex items-start gap-4">
                <AbdulAvatar className="h-9 w-9" />
                <div className="flex items-center gap-2 rounded-2xl bg-slate-tint px-5 py-3 text-sm text-ink-soft">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <form onSubmit={handleSubmit} className="border-t border-line bg-paper p-4">
            <div className="flex items-center gap-2 rounded-full border border-line-strong bg-paper px-5 py-3 transition-all duration-200 focus-within:border-sky focus-within:shadow-[0_0_0_1px_rgba(2,132,199,0.35),0_0_0_4px_rgba(2,132,199,0.10)]">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Abdul about our products…"
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-mute"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-sky text-white transition-all duration-200 hover:bg-sky-dark disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* CTA */}
        <div className="mx-auto mt-14 max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold md:text-3xl">
            Want to browse instead?
          </h2>
          <p className="mt-3 text-ink-soft">
            The full catalog is a click away.
          </p>
          <Link to="/products" className="btn-glow mt-6 inline-flex">
            Shop all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Bubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-sky px-5 py-3 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4">
      <AbdulAvatar className="h-9 w-9" />
      <div className="flex-1 space-y-3">
        <div
          className={cn(
            'rounded-2xl rounded-tl-sm px-5 py-3.5 text-sm leading-relaxed',
            message.error ? 'bg-clay-tint text-clay-dark' : 'bg-slate-tint text-ink'
          )}
        >
          {message.content}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.sources.map((s) => (
              <Link
                key={s.productId}
                to={`/products/${s.slug}`}
                className="rounded-full border border-sky/30 bg-sky-tint/40 px-3.5 py-1.5 text-xs font-medium text-sky-dark transition-colors hover:bg-sky-tint"
              >
                {s.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
