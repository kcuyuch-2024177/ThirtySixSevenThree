import { Link } from 'react-router-dom';

const cards = [
  {
    to: '/productos',
    title: 'Productos',
    description: 'Catálogo completo: crear, editar, buscar y eliminar productos.',
  },
  {
    to: '/movimientos',
    title: 'Movimientos',
    description: 'Registra entradas y salidas para mantener el stock al día.',
  },
  {
    to: '/alertas',
    title: 'Alertas',
    description: 'Revisa productos con stock bajo o agotados.',
  },
  {
    to: '/reportes',
    title: 'Reportes',
    description: 'Resumen del inventario, categorías y top productos.',
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-deep">Inicio</h1>
        <p className="mt-1 text-sm text-brand-blue/80">
          Bienvenido a Ynventory. Elige una sección para continuar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="rounded-2xl border border-brand-200/70 bg-white/90 px-5 py-6 transition hover:border-brand-purple hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-brand-deep">{card.title}</h2>
            <p className="mt-2 text-sm text-brand-blue/80">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
