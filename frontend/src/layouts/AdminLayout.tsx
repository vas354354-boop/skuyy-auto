import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CarFront, MessageCircle, FileText, LogOut, Globe } from 'lucide-react';
import clsx from 'clsx';
import { authService, statsService } from '../services/api';
import type { Stats } from '../services/api';
import { getToken } from '../services/session';
import { useAuthStore } from '../store/useAuthStore';

const link = 'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const hasToken = !!getToken();

  // Validasi sesi ke server & ambil angka badge; 401 otomatis diarahkan ke login oleh api.ts
  useEffect(() => {
    if (!hasToken) return;
    authService.me().catch(() => undefined);
  }, [hasToken]);

  useEffect(() => {
    if (!hasToken) return;
    statsService.get().then((r) => setStats(r.data)).catch(() => undefined);
  }, [hasToken, location.pathname]);

  if (!hasToken) return <Navigate to="/admin/login" replace />;

  const nav = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/kendaraan', label: 'Kendaraan', icon: CarFront, end: false },
    { to: '/admin/titip-jual', label: 'Titip Jual', icon: FileText, end: false, badge: stats?.consignment.pending },
    { to: '/admin/leads', label: 'WhatsApp Leads', icon: MessageCircle, end: false, badge: stats?.leads.new },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-[#1a2744] text-white flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-[#243460]">
          <img src="/logo.jpg" alt="Lucky MotorCars 13" className="h-14 w-auto object-contain brightness-0 invert" />
          <div className="text-xs text-slate-400 mt-2 font-semibold tracking-wider uppercase">Admin Panel</div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {nav.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => clsx(link, isActive ? 'bg-[#243460] text-white' : 'text-slate-300 hover:text-white hover:bg-[#243460]')}
            >
              <Icon className="w-5 h-5" /> <span className="flex-1">{label}</span>
              {!!badge && <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-black text-slate-900">{badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-[#243460] space-y-1">
          <NavLink to="/" className={clsx(link, 'text-slate-400 hover:text-white hover:bg-[#243460]')}>
            <Globe className="w-5 h-5" /> Lihat Website
          </NavLink>
          <button onClick={handleLogout} className={clsx(link, 'w-full text-slate-400 hover:text-white hover:bg-[#243460]')}>
            <LogOut className="w-5 h-5" /> Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-bold text-[#1a2744]">Lucky MotorCars 13 — Admin</h2>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{user?.name || 'Admin'}</div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
