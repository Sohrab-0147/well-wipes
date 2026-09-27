import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/lib/themeStore';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-all duration-300 hover:bg-slate-tint hover:text-ink',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5" strokeWidth={1.8} />
      ) : (
        <Moon className="h-4.5 w-4.5" strokeWidth={1.8} />
      )}
    </button>
  );
}
