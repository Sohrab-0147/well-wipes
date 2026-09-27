import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────
// Set this to your friend's business WhatsApp number.
// Format: country code + number, no spaces, no +
// Example: 919876543210 for +91 98765 43210
// ─────────────────────────────────────────────
const WHATSAPP_NUMBER = '916291035517';

const DEFAULT_MESSAGE = "Hi! I'm browsing Well-Wipes and have a question.";

export function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Don't show on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const handleChat = () => {
    const text = encodeURIComponent(DEFAULT_MESSAGE);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  return (
    <>
      {/* Expanded panel */}
      {open && (
        <div className="fixed bottom-24 left-6 z-50 w-[min(340px,calc(100vw-3rem))] overflow-hidden rounded-3xl border border-line bg-paper shadow-lift">
          <div className="flex items-center justify-between border-b border-line bg-gradient-to-r from-mint-tint to-sky-tint px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#25D366] text-white">
                <WhatsAppIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">Chat with us</p>
                <p className="text-[11px] text-ink-soft">Usually replies within minutes</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-ink-mute transition-colors hover:bg-paper/60 hover:text-ink"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5">
            <p className="text-sm leading-relaxed text-ink-soft">
              Have a question about a product, order, or delivery? Message us on WhatsApp
              and we'll get back to you right away.
            </p>

            <button
              onClick={handleChat}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1DA851] hover:shadow-lift"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Start chat
            </button>

            <p className="mt-3 text-center text-[11px] text-ink-mute">
              Opens WhatsApp on your device
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-glow transition-all duration-300 hover:scale-105',
          open ? 'rotate-0 bg-ink hover:bg-ink-soft' : 'bg-[#25D366] hover:bg-[#1DA851]'
        )}
        aria-label={open ? 'Close WhatsApp' : 'Chat on WhatsApp'}
      >
        {open ? (
          <X className="h-6 w-6" strokeWidth={2} />
        ) : (
          <WhatsAppIcon className="h-6 w-6" />
        )}
      </button>
    </>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
