import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, LogOut, Menu, Package, Receipt, Tag, X } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { authApi } from '@/api/auth';
import { toast } from '@/lib/toastStore';
import { cn } from '@/lib/utils';
import { StackMark } from '@/components/ProductImage';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/orders', label: 'Orders', icon: Receipt, end: false },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag, end: false },
];

export function AdminLayout() {
  const { user, clear } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clear();
    toast.success('Signed out');
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
      isActive
        ? 'bg-sky text-white shadow-glow-sm'
        : 'text-ink-soft hover:bg-slate-tint hover:text-ink'
    );

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky text-white">
          <StackMark className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold leading-none">Well-Wipes</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-mute">
            Admin
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="rounded-full p-2 text-ink-mute transition-colors hover:bg-slate-tint hover:text-ink lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}

        <div className="mt-auto pt-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-ink-soft transition-all duration-200 hover:bg-slate-tint hover:text-ink"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.8} />
            Back to store
          </Link>
        </div>
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-2xl px-3 py-2">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky text-xs font-semibold text-white">
              {user?.email[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-ink">
              {user?.fullName || 'Admin'}
            </p>
            <p className="truncate text-[11px] text-ink-mute">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full p-2 text-ink-mute transition-colors hover:bg-clay-tint hover:text-clay"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-tint">
      {/* Desktop sidebar — fixed, always visible on lg+ */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-paper lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile drawer — slides in from the left */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Drawer panel */}
        <aside
          className={cn(
            'absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-paper shadow-lift transition-transform duration-300',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarContent}
        </aside>
      </div>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top bar with hamburger on the LEFT */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-paper px-4 lg:px-6">
          <button
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-paper text-ink transition-all duration-300 hover:border-sky/60 hover:text-sky"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-ink lg:hidden">Admin</span>
            <span className="hidden text-sm font-medium text-ink-soft lg:inline">
              Well-Wipes · Admin
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              className="hidden text-sm font-medium text-ink-soft transition-colors hover:text-sky sm:inline"
            >
              View store
            </Link>
            {user?.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-8 w-8 rounded-full"
              />
            )}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
