import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, LogOut, Package, Receipt } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { authApi } from '@/api/auth';
import { toast } from '@/lib/toastStore';
import { cn } from '@/lib/utils';
import { StackMark } from '@/components/ProductImage';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/orders', label: 'Orders', icon: Receipt, end: false },
];

export function AdminLayout() {
  const { user, clear } = useAuthStore();
  const navigate = useNavigate();

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

  return (
    <div className="flex min-h-screen bg-slate-tint">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-paper lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky text-white">
            <StackMark className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">Well-Wipes</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-mute">
              Admin
            </p>
          </div>
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
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-line bg-paper px-4 lg:hidden">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky text-white">
              <StackMark className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold">Admin</span>
          </Link>
          <Link to="/" className="text-xs font-medium text-ink-soft">
            Back to store
          </Link>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-line bg-paper px-3 py-2 lg:hidden">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-colors',
                  isActive ? 'bg-sky text-white' : 'text-ink-soft hover:bg-slate-tint'
                )
              }
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
