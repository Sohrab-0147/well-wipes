import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from './authStore';
import { authApi } from '@/api/auth';
import { StackMark } from '@/components/ProductImage';

export function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get('access_token');
    const errorParam = params.get('error');

    if (errorParam || !token) {
      navigate('/login?error=' + (errorParam || 'no_token'), { replace: true });
      return;
    }

    const store = useAuthStore.getState();
    store.setToken(token);

    authApi
      .me()
      .then((user) => {
        useAuthStore.getState().setUser(user);
        navigate('/', { replace: true });
      })
      .catch(() => {
        useAuthStore.getState().clear();
        navigate('/login?error=invalid_token', { replace: true });
      });
  }, [params, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper">
      <div className="absolute inset-0 bg-sky-soft" />
      <div className="relative flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky text-white shadow-glow">
          <StackMark className="h-8 w-8" />
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-sky" />
        <div>
          <p className="text-lg font-semibold text-ink">Signing you in…</p>
          <p className="mt-1 text-sm text-ink-soft">Just a moment</p>
        </div>
      </div>
    </div>
  );
}
