import { useEffect } from 'react';

const SUFFIX = 'Well-Wipes';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : `${SUFFIX} — Everyday softness`;
  }, [title]);
}
