import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll to top on route change.
 * Skips hash anchors (#section) so in-page links still work.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Don't reset if navigating to an anchor
    if (hash) return;

    // Instant scroll — smooth would feel laggy on navigation
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}
