import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  BellRing,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import Logo from './Logo';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { to: '/dashboard', label: 'Inicio', end: true, icon: LayoutDashboard },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
  { to: '/alertas', label: 'Alertas', icon: BellRing },
  { to: '/reportes', label: 'Reportes', icon: ClipboardList },
];

function navClass({ isActive }) {
  return [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
    isActive
      ? 'bg-gradient-to-r from-[#5411AE] to-[#3B5897] text-[#E8E0FF] shadow-[0_8px_24px_rgba(84,17,174,0.35)]'
      : 'text-[#A785EF] hover:bg-[#5411AE]/25 hover:text-[#8280F7]',
  ].join(' ');
}

export default function AppLayout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  function handleLogout() {
    clearAuth();
    navigate('/', { replace: true });
  }

  return (
    <div className="relative min-h-screen overflow-hidden lg:flex">
      <AnimatedBackground />

      <aside className="relative z-10 hidden w-64 shrink-0 flex-col border-r border-[#8280F7]/20 bg-[#36084D]/75 backdrop-blur-xl lg:flex">
        <div className="border-b border-[#8280F7]/15 px-5 py-5">
          <div className="flex items-center gap-3">
            <Logo size="sm" blend="lighten" />
            <div>
              <p className="font-display text-lg font-semibold tracking-tight text-[#E8E0FF]">
                <span className="text-[#8280F7]">Y</span>nventory
              </p>
              <p className="text-xs text-[#A785EF]/75">Panel de inventario</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-[#8280F7]/15 p-4">
          <motion.button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#8280F7]/25 bg-[#5411AE]/20 px-3 py-2.5 text-sm font-medium text-[#A785EF] transition hover:border-[#A785EF]/50 hover:bg-[#5411AE]/35 hover:text-[#E8E0FF]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </motion.button>
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="border-b border-[#8280F7]/20 bg-[#36084D]/80 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <Logo size="sm" blend="lighten" />
              <div>
                <p className="font-display text-base font-semibold tracking-tight text-[#E8E0FF]">
                  <span className="text-[#8280F7]">Y</span>nventory
                </p>
                <p className="text-xs text-[#A785EF]/75">Panel de inventario</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-[#8280F7]/25 px-3 py-1.5 text-sm font-medium text-[#A785EF] transition hover:bg-[#5411AE]/30 hover:text-[#E8E0FF]"
            >
              Salir
            </button>
          </div>

          <nav className="flex gap-1.5 overflow-x-auto px-3 pb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-gradient-to-r from-[#5411AE] to-[#3B5897] text-[#E8E0FF]'
                        : 'text-[#A785EF] hover:bg-[#5411AE]/25',
                    ].join(' ')
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
