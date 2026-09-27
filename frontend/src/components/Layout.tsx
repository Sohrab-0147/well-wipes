import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X, ChevronDown, User, LogOut, Package, Tag, Truck, Zap, Leaf, Headphones } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { useCartStore } from '@/features/cart/cartStore';
import { authApi } from '@/api/auth';
import { toast } from '@/lib/toastStore';
import { cn } from '@/lib/utils';
import { LogoMark } from './Logo';
import { NavSearch } from './NavSearch';
import { ThemeToggle } from './ThemeToggle';
import { AiChatWidget } from '@/features/ai/AiChatWidget';
import { CartDrawer } from '@/features/cart/CartDrawer';
import { useCartDrawerStore } from '@/features/cart/cartDrawerStore';
import { BackToTop } from './BackToTop';
import { NewsletterSignup } from './NewsletterSignup';
import { WhatsAppButton } from './WhatsAppButton';

// Primary nav — 5 items max for cognitive ease
const NAV_ITEMS = [
  { to: '/products', label: 'Shop' },
  { to: '/products?category=facial-tissue', label: 'Facial' },
  { to: '/products?category=kitchen-roll', label: 'Kitchen' },
  { to: '/about', label: 'Our story' },
  { to: '/ai', label: 'Ask Abdul', badge: null },
];

export function Layout() {
  const { user, clear } = useAuthStore();
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Shrink navbar on scroll — premium behavior
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clear();
    toast.success('Signed out', { description: 'See you again soon.' });
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* ─── Announcement bar — colored, visible ─── */}
      <div className="bg-gradient-to-r from-sky via-sky-dark to-sky text-white">
        <div className="page-container flex h-9 items-center justify-center gap-6 text-xs font-medium">
          <span className="hidden items-center gap-1.5 md:flex">
            <Truck className="h-3.5 w-3.5" strokeWidth={2} />
            Free shipping over ₹499
          </span>
          <span className="hidden h-3 w-px bg-white/30 md:block" />
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" strokeWidth={2} />
            Ships within 24 hours
          </span>
          <span className="hidden h-3 w-px bg-white/30 md:block" />
          <span className="hidden items-center gap-1.5 md:flex">
            <Leaf className="h-3.5 w-3.5" strokeWidth={2} />
            100% recycled
          </span>
        </div>
      </div>

      {/* ─── Main navbar ─── */}
      <header
        className={cn(
          'sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md transition-all duration-300',
          scrolled && 'shadow-soft'
        )}
      >
        <div className={cn(
          'page-container flex items-center gap-6 transition-all duration-300',
          scrolled ? 'h-14' : 'h-16'
        )}>
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5"
            onClick={() => { setMenuOpen(false); setMobileSearchOpen(false); }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky text-white shadow-glow-sm">
              <LogoMark className="h-5 w-5" />
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">
              Well-Wipes
            </span>
          </Link>

          {/* Search — sits right after logo, before nav */}
          <div className="hidden flex-1 md:block md:max-w-sm lg:max-w-md">
            <NavSearch />
          </div>

          {/* Desktop nav — 5 items, after search */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-sky bg-sky-tint/50'
                      : 'text-ink-soft hover:text-ink hover:bg-slate-tint'
                  )
                }
              >
                <span className="flex items-center gap-1.5">
                  {item.label}
                  {item.badge && (
                    <span className="rounded-full bg-clay px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                      {item.badge}
                    </span>
                  )}
                </span>
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1.5">
            {/* Mobile search toggle */}
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-slate-tint hover:text-ink md:hidden"
              aria-label="Search"
            >
              {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            {/* Cart */}
            <ThemeToggle />

            <button
              onClick={() => useCartDrawerStore.getState().openDrawer()}
              className="relative flex h-9 items-center gap-2 rounded-full px-3 text-ink-soft transition-all duration-200 hover:bg-slate-tint hover:text-ink"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.8} />
              {itemCount > 0 && (
                <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="group relative">
                <button className="flex h-9 items-center gap-2 rounded-full pl-1 pr-2.5 transition-all duration-200 hover:bg-slate-tint">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky text-xs font-semibold text-white">
                      {user.email[0].toUpperCase()}
                    </div>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 text-ink-mute" />
                </button>

                <div className="invisible absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-line bg-paper p-1.5 opacity-0 shadow-lift transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <div className="border-b border-line px-3 py-2">
                    <p className="truncate text-sm font-semibold text-ink">
                      {user.fullName || 'Account'}
                    </p>
                    <p className="truncate text-[11px] text-ink-mute">{user.email}</p>
                  </div>
                  <Link to="/orders" className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-sky-tint/50 hover:text-sky">
                    <Package className="h-3.5 w-3.5" />
                    My orders
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-sky-tint/50 hover:text-sky">
                      <Tag className="h-3.5 w-3.5" />
                      Admin panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-clay-tint hover:text-clay"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden h-9 items-center gap-1.5 rounded-full bg-sky px-4 text-sm font-medium text-white transition-all duration-200 hover:bg-sky-dark hover:shadow-glow-sm sm:inline-flex"
              >
                <User className="h-3.5 w-3.5" />
                Sign in
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-slate-tint hover:text-ink lg:hidden"
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
            <nav className="page-container flex flex-col py-3">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive ? 'text-sky bg-sky-tint/50' : 'text-ink-soft hover:bg-slate-tint'
                    )
                  }
                >
                  {item.label}
                  {item.badge && (
                    <span className="rounded-full bg-clay px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-sky px-4 text-sm font-medium text-white"
                >
                  <User className="h-4 w-4" />
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
                  <LogoMark className="h-5 w-5" />
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
                <li><Link to="/products?category=facial-tissue" className="hover:text-sky">Facial tissue</Link></li>
                <li><Link to="/products?category=kitchen-roll" className="hover:text-sky">Kitchen roll</Link></li>
                <li><Link to="/products?category=wet-wipes" className="hover:text-sky">Wet wipes</Link></li>
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

          <div className="mt-12 max-w-md">
            <NewsletterSignup />
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-xs text-ink-mute md:flex-row">
            <p>© {new Date().getFullYear()} Well-Wipes. All rights reserved.</p>
            <p>Made with care in Solapur, India.</p>
          </div>
        </div>
      </footer>

      <AiChatWidget />
      <WhatsAppButton />
      <BackToTop />
      <CartDrawer />
    </div>
  );
}
