import { X } from 'lucide-react';
import { useToastStore } from '@/lib/toastStore';

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto min-w-[300px] max-w-md animate-slide-up rounded-2xl border border-line bg-paper p-4 shadow-lift"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs text-ink-soft">{t.description}</p>
              )}
              {t.action && (
                <button
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                  className="mt-2 text-xs font-semibold text-sky hover:text-sky-dark"
                >
                  {t.action.label} →
                </button>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded-full p-1 text-ink-mute transition-colors hover:bg-slate-tint hover:text-ink"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
