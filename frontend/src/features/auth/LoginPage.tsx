import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useAuthStore } from './authStore';
import { StackMark } from '@/components/ProductImage';

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8081';

export function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) navigate('/', { replace: true });
  }, [token, navigate]);

  const error = params.get('error');

  const handleLogin = () => {
    window.location.href = `${AUTH_URL}/oauth2/authorization/google`;
  };

  const errorMessage =
    error === 'no_token'
      ? 'Sign-in failed: no token received.'
      : error === 'invalid_token'
        ? 'Sign-in failed: token invalid.'
        : error === 'no_email'
          ? 'Sign-in failed: your account has no email.'
          : error
            ? 'Something went wrong. Please try again.'
            : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      {/* Soft sky atmosphere */}
      <div className="absolute inset-0 bg-sky-soft" />

      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* Left — brand panel */}
        <div className="hidden flex-col justify-between p-12 lg:flex">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky text-white shadow-glow-sm">
              <StackMark className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Well-Wipes</span>
          </Link>

          <div>
            <p className="eyebrow text-sky">Welcome back</p>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight text-ink">
              Softness,
              <br />
              <span className="text-sky">by the sheet.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              Sign in to track orders, save favourites, and check out faster.
            </p>

            <div className="mt-12 space-y-4">
              {[
                { icon: Truck, label: 'Free shipping over ₹499' },
                { icon: ShieldCheck, label: 'Secure payments with Stripe' },
                { icon: Sparkles, label: 'Personalised recommendations' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-mint-tint text-mint-dark">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-ink-soft">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-ink-mute">
            © {new Date().getFullYear()} Well-Wipes. Made with care in Coimbatore.
          </p>
        </div>

        {/* Right — sign-in card */}
        <div className="flex flex-col items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-sky lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" /> Back home
            </Link>

            <div className="rounded-4xl border border-line bg-paper p-8 shadow-lift md:p-10">
              <div className="flex items-center gap-2.5 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky text-white shadow-glow-sm">
                  <StackMark className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight">Well-Wipes</span>
              </div>

              <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-ink lg:mt-0">
                Sign in
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                Use your Google account to continue.
              </p>

              {errorMessage && (
                <div className="mt-6 rounded-2xl border border-clay/20 bg-clay-tint px-4 py-3 text-sm text-clay-dark">
                  {errorMessage}
                </div>
              )}

              <button onClick={handleLogin} className="btn-glow-lg mt-8 w-full">
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="mt-8 border-t border-line pt-6">
                <p className="text-center text-xs text-ink-mute">
                  By continuing, you agree to our{' '}
                  <a href="#" className="underline hover:text-ink-soft">
                    terms
                  </a>{' '}
                  and{' '}
                  <a href="#" className="underline hover:text-ink-soft">
                    privacy policy
                  </a>
                  .
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-ink-soft">
              New to Well-Wipes? No signup needed — just continue with Google.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#ffffff"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#ffffff"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#ffffff"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#ffffff"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
