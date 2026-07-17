import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { to: '/dashboard', label: 'Inicio', end: true },
  { to: '/productos', label: 'Productos' },
  { to: '/movimientos', label: 'Movimientos' },
  { to: '/alertas', label: 'Alertas' },
  { to: '/reportes', label: 'Reportes' },
];

function navClass({ isActive }) {
  return [
    'block rounded-xl px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-brand-purple/10 text-brand-purple'
      : 'text-brand-blue hover:bg-brand-50 hover:text-brand-purple',
  ].join(' ');
}

export default function AppLayout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  function handleLogout() {
    clearAuth();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-brand-200/70 bg-white/90 backdrop-blur lg:flex">
        <div className="border-b border-brand-100 px-5 py-5">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showWordmark={false} className="!items-start" />
            <div>
              <p className="text-lg font-semibold tracking-tight">
                <span className="text-brand-blue">Y</span>
                <span className="text-brand-deep">nventory</span>
              </p>
              <p className="text-xs text-brand-blue/70">Panel de inventario</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-brand-100 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm font-medium text-brand-deep transition hover:border-brand-purple hover:bg-brand-50 hover:text-brand-purple"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-brand-200/70 bg-white/85 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <BrandLogo size="sm" showWordmark={false} className="!items-start" />
              <div>
                <p className="text-base font-semibold tracking-tight">
                  <span className="text-brand-blue">Y</span>
                  <span className="text-brand-deep">nventory</span>
                </p>
                <p className="text-xs text-brand-blue/70">Panel de inventario</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-deep transition hover:border-brand-purple hover:bg-brand-50"
            >
              Salir
            </button>
          </div>

          <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-brand-purple/10 text-brand-purple'
                      : 'text-brand-blue hover:bg-brand-50',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
