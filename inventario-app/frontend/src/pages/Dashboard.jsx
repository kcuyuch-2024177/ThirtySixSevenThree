import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-deep">Inicio</h1>
        <p className="mt-1 text-sm text-brand-blue/80">
          Bienvenido a Ynventory. Gestiona productos y movimientos de inventario.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/productos"
          className="rounded-2xl border border-brand-200/70 bg-white/90 px-5 py-6 transition hover:border-brand-purple hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-brand-deep">Productos</h2>
          <p className="mt-2 text-sm text-brand-blue/80">
            Consulta el catálogo, crea productos nuevos y edita o elimina existentes.
          </p>
        </Link>

        <Link
          to="/movimientos"
          className="rounded-2xl border border-brand-200/70 bg-white/90 px-5 py-6 transition hover:border-brand-purple hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-brand-deep">Movimientos</h2>
          <p className="mt-2 text-sm text-brand-blue/80">
            Registra entradas y salidas para mantener el stock al día.
          </p>
        </Link>
      </div>
    </div>
  );
}
