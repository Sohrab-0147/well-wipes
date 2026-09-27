import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggle: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        applyTheme(next);
        set({ theme: next });
      },
      setTheme: (t) => {
        applyTheme(t);
        set({ theme: t });
      },
    }),
    {
      name: 'ww-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);

// Apply on first import so theme is correct even before hydration
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('ww-theme');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.theme) applyTheme(parsed.state.theme);
    } catch { /* ignore */ }
  }
}
