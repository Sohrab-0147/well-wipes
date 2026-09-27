import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { useCartStore } from '@/features/cart/cartStore';
import { authApi } from '@/api/auth';
import { toast } from '@/lib/toastStore';
import { cn } from '@/lib/utils';
import { StackMark } from './ProductImage';
import { NavSearch } from './NavSearch';
import { WhatsAppButton } from './WhatsAppButton';
import { AiChatWidget } from '@/features/ai/AiChatWidget';

export function Layout() {
  const { user, clear } = useAuthStore();
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clear();
    toast.success('Signed out', { description: 'See you again soon.' });
    navigate('/');
  };

  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium whitespace-nowrap transition-colors duration-200',
      isActive ? 'text-sky' : 'text-ink-soft hover:text-ink'
    );

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Announcement */}
      <div className="bg-sky text-white">
        <div className="page-container flex h-9 items-center justify-center text-xs font-semibold tracking-wide">
          Free shipping over ₹499 · Ships in 24 hours
        </div>
      </div>

      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="page-container flex h-16 items-center gap-4">
          {/* 1. Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5"
            onClick={() => { setMenuOpen(false); setMobileSearchOpen(false); }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky text-white shadow-glow-sm">
              <StackMark className="h-5 w-5" />
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">
              Well-Wipes
            </span>
          </Link>

          {/* 2. Admin link — sits between logo and search, admins only */}
          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-medium whitespace-nowrap text-ink-soft transition-colors hover:text-sky sm:inline-flex"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-clay" />
              Admin
            </NavLink>
          )}

          {/* 3. Search */}
          <div className="hidden md:block md:w-64 lg:w-80 xl:w-96">
            <NavSearch />
          </div>

          {/* 4. Nav links */}
          <nav className="hidden items-center gap-6 lg:flex">
            <NavLink to="/products" className={navLink}>Shop</NavLink>
            <NavLink to="/about" className={navLink}>Our story</NavLink>
            <NavLink to="/ai" className={navLink}>Ask Abdul</NavLink>
          </nav>

          {/* 5. Actions pushed right */}
          <div className="ml-auto flex items-center gap-1.5">
            {/* Mobile search toggle */}
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-slate-tint hover:text-ink md:hidden"
              aria-label="Search"
            >
              {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex h-10 items-center gap-2 rounded-full border border-line-strong bg-paper px-3 text-ink transition-all duration-300 hover:border-sky/60 hover:bg-sky-tint/40 hover:text-sky"
              aria-label="Cart"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.8} />
              {itemCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-clay px-1.5 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="group relative">
                <button className="flex h-10 items-center gap-2 rounded-full border border-line-strong bg-paper pl-1 pr-3 transition-all duration-300 hover:border-sky/60 hover:bg-sky-tint/40">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky text-xs font-semibold text-white">
                      {user.email[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden text-sm font-medium text-ink-soft sm:inline">
                    {user.fullName?.split(' ')[0] || 'Account'}
                  </span>
                </button>
                <div className="invisible absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-line bg-paper p-1.5 opacity-0 shadow-lift transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <Link to="/orders" className="block rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-sky-tint/50 hover:text-sky">
                    My orders
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="block rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-sky-tint/50 hover:text-sky">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-sky-tint/50 hover:text-sky"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-nav hidden sm:inline-flex">
                Sign in
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-paper text-ink transition-all duration-300 hover:border-sky/60 hover:text-sky lg:hidden"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search row */}
        {mobileSearchOpen && (
          <div className="border-t border-line bg-paper p-3 md:hidden">
            <NavSearch autoFocus />
          </div>
        )}

        {/* Mobile nav */}
        {menuOpen && (
          <div className="border-t border-line bg-paper lg:hidden">
            <nav className="page-container flex flex-col py-4">
              <Link to="/products" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm text-ink-soft">
                Shop
              </Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm text-ink-soft">
                Our story
              </Link>
              <Link to="/ai" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm text-ink-soft">
                Ask Abdul
              </Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm text-ink-soft">
                  Admin
                </Link>
              )}
              {!user && (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-nav mt-3 self-start">
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-24 border-t border-line bg-slate-tint">
        <div className="page-container py-16">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky text-white">
                  <StackMark className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold">Well-Wipes</span>
              </div>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
                Everyday tissue, made the slow way. Recycled pulp, gentle on skin, shipped across India.
              </p>
            </div>

            <div className="md:col-span-2">
              <h4 className="eyebrow mb-4">Shop</h4>
              <ul className="space-y-2.5 text-sm text-ink-soft">
                <li><Link to="/products" className="hover:text-sky">All products</Link></li>
                <li><Link to="/products" className="hover:text-sky">Facial tissue</Link></li>
                <li><Link to="/products" className="hover:text-sky">Kitchen roll</Link></li>
                <li><Link to="/products" className="hover:text-sky">Wet wipes</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="eyebrow mb-4">Help</h4>
              <ul className="space-y-2.5 text-sm text-ink-soft">
                <li><a href="#" className="hover:text-sky">Shipping</a></li>
                <li><a href="#" className="hover:text-sky">Returns</a></li>
                <li><a href="#" className="hover:text-sky">Contact</a></li>
                <li><a href="#" className="hover:text-sky">FAQ</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="eyebrow mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-ink-soft">
                <li><Link to="/about" className="hover:text-sky">Our story</Link></li>
                <li><a href="#" className="hover:text-sky">Sustainability</a></li>
                <li><a href="#" className="hover:text-sky">Press</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="eyebrow mb-4">Promise</h4>
              <ul className="space-y-2.5 text-sm text-ink-soft">
                <li>100% recycled</li>
                <li>Plastic-free</li>
                <li>Made in India</li>
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-xs text-ink-mute md:flex-row">
            <p>© {new Date().getFullYear()} Well-Wipes. All rights reserved.</p>
            <p>Made with care in Coimbatore, India.</p>
          </div>
        </div>
      </footer>
      <WhatsAppButton />
      <AiChatWidget />
    </div>
  );
}
