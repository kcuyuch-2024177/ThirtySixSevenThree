import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { useAuthStore } from '../store/authStore';

const navLinkClass = ({ isActive }) =>
  isActive ? 'text-brand-purple' : 'text-brand-blue hover:text-brand-purple';

export default function AppLayout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  function handleLogout() {
    clearAuth();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-brand-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-3">
            <BrandLogo size="sm" showWordmark={false} />
            <div>
              <p className="text-lg font-semibold tracking-tight">
                <span className="text-brand-blue">Y</span>
                <span className="text-brand-deep">nventory</span>
              </p>
              <p className="text-sm text-brand-blue/70">Dashboard</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-4 text-sm font-medium sm:flex">
            <NavLink to="/dashboard" className={navLinkClass} end>
              Inicio
            </NavLink>
            <NavLink to="/productos" className={navLinkClass}>
              Productos
            </NavLink>
            <NavLink to="/movimientos" className={navLinkClass}>
              Movimientos
            </NavLink>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-deep transition hover:border-brand-purple hover:bg-brand-50 hover:text-brand-purple"
          >
            Cerrar sesión
          </button>
        </div>

        <nav className="mx-auto flex max-w-5xl gap-4 border-t border-brand-100 px-4 py-2 text-sm font-medium sm:hidden">
          <NavLink to="/dashboard" className={navLinkClass} end>
            Inicio
          </NavLink>
          <NavLink to="/productos" className={navLinkClass}>
            Productos
          </NavLink>
          <NavLink to="/movimientos" className={navLinkClass}>
            Movimientos
          </NavLink>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
