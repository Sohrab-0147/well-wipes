import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { apiClient } from '@/api/client';
import { StackMark } from '@/components/ProductImage';
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
];

const STORAGE_KEY = 'ww-ai-chat';

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Message[];
    } catch {
      /* ignore */
    }
    return [];
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    };

    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post<AskResponse>('/api/v1/ai/ask', {
        question: trimmed,
      });

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources,
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        'Something went wrong. Please try again.';
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: msg,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-glow transition-all duration-300',
          open
            ? 'bg-ink hover:bg-ink-soft'
            : 'bg-sky hover:bg-sky-dark hover:scale-105'
        )}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? (
          <X className="h-6 w-6" strokeWidth={2} />
        ) : (
          <MessageCircle className="h-6 w-6" strokeWidth={2} />
        )}
      </button>

      <div
        className={cn(
          'fixed bottom-24 right-6 z-50 flex w-[min(420px,calc(100vw-3rem))] flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-lift transition-all duration-300',
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0'
        )}
        style={{ maxHeight: 'min(620px, calc(100vh - 8rem))' }}
      >
        <div className="flex items-center gap-3 border-b border-line bg-gradient-to-r from-sky-tint via-paper to-mint-tint px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky text-white shadow-glow-sm">
            <StackMark className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-ink">Ask Abdul</p>
            <p className="text-[11px] text-ink-soft">
              <Sparkles className="mr-1 inline h-3 w-3" />
              Your Well-Wipes assistant
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="rounded-full px-2.5 py-1 text-[11px] font-medium text-ink-mute transition-colors hover:bg-paper/60 hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>

        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
          style={{ minHeight: 300 }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col gap-4 py-4">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-tint to-mint-tint">
                  <Sparkles className="h-5 w-5 text-sky" />
                </div>
                <p className="mt-4 text-sm font-semibold text-ink">
                  Hi, I'm Abdul. Ask me anything about our products.
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  I know every product in the Well-Wipes catalog.
                </p>
              </div>

              <div className="mt-2 space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full rounded-2xl border border-line bg-paper px-4 py-3 text-left text-sm text-ink-soft transition-all duration-200 hover:border-sky/40 hover:bg-sky-tint/30 hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
          )}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl bg-sky text-white">
                <StackMark className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-tint px-4 py-2.5 text-sm text-ink-soft">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Thinking…
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-line bg-paper p-3"
        >
          <div className="flex items-center gap-2 rounded-full border border-line-strong bg-paper px-4 py-2 transition-all duration-200 focus-within:border-sky focus-within:shadow-[0_0_0_1px_rgba(2,132,199,0.35),0_0_0_4px_rgba(2,132,199,0.10)]">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Abdul…"
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-mute"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-sky text-white transition-all duration-200 hover:bg-sky-dark disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-sky px-4 py-2.5 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl bg-sky text-white">
        <StackMark className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 space-y-2">
        <div
          className={cn(
            'rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed',
            message.error
              ? 'bg-clay-tint text-clay-dark'
              : 'bg-slate-tint text-ink'
          )}
        >
          {message.content}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((s) => (
              <Link
                key={s.productId}
                to={`/products/${s.slug}`}
                className="rounded-full border border-sky/30 bg-sky-tint/40 px-3 py-1 text-[11px] font-medium text-sky-dark transition-colors hover:bg-sky-tint"
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
