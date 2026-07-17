import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../api/axios';
import ErrorBanner from '../components/ErrorBanner';
import LoadingBlock from '../components/LoadingBlock';
import { useToastStore } from '../store/toastStore';
import { formatCurrency, formatNumber, getApiErrorMessage } from '../utils/validation';

const DEFAULT_THRESHOLD = 5;

function ProductAlertList({ products, emptyMessage, accent = 'amber' }) {
  if (products.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-brand-blue/70">{emptyMessage}</p>;
  }

  const accentClass =
    accent === 'red'
      ? 'border-red-100 bg-red-50/50'
      : 'border-amber-100 bg-amber-50/40';

  return (
    <ul className="divide-y divide-brand-100">
      {products.map((product) => (
        <li key={product._id} className={`px-4 py-3 ${accentClass}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-brand-deep">{product.nombre}</p>
              <p className="text-xs text-brand-blue/70">{product.categoria}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-brand-deep">Stock: {formatNumber(product.existencia)}</p>
              <p className="text-xs text-brand-blue/70">{formatCurrency(product.precio)}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Alerts() {
  const showToast = useToastStore((state) => state.showToast);

  const [threshold, setThreshold] = useState(String(DEFAULT_THRESHOLD));
  const [thresholdError, setThresholdError] = useState('');
  const [appliedThreshold, setAppliedThreshold] = useState(DEFAULT_THRESHOLD);

  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAlerts = useCallback(
    async (nextThreshold = appliedThreshold) => {
      setLoading(true);
      setError('');

      try {
        const [lowRes, outRes] = await Promise.all([
          reportsApi.get('/alerts/low-stock', { params: { threshold: nextThreshold } }),
          reportsApi.get('/alerts/out-of-stock'),
        ]);

        setLowStock(lowRes.data.data?.productos ?? []);
        setOutOfStock(outRes.data.data?.productos ?? []);
        setAppliedThreshold(lowRes.data.data?.threshold ?? nextThreshold);
      } catch (err) {
        const message = getApiErrorMessage(err, 'No se pudieron cargar las alertas');
        setError(message);
        showToast(message);
      } finally {
        setLoading(false);
      }
    },
    [appliedThreshold, showToast],
  );

  useEffect(() => {
    loadAlerts(DEFAULT_THRESHOLD);
  }, []);

  function handleApplyThreshold(event) {
    event.preventDefault();
    const value = Number(threshold);

    if (!threshold.trim() || Number.isNaN(value) || !Number.isInteger(value) || value < 1) {
      setThresholdError('Indica un umbral entero mayor o igual a 1');
      return;
    }
    if (value > 10000) {
      setThresholdError('El umbral es demasiado alto');
      return;
    }

    setThresholdError('');
    loadAlerts(value);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-deep">Dashboard de alertas</h1>
          <p className="mt-1 text-sm text-brand-blue/80">
            Productos con stock bajo o agotado, según el inventario actual.
          </p>
        </div>
        <Link
          to="/movimientos"
          className="text-sm font-semibold text-brand-purple hover:underline"
        >
          Ir a movimientos →
        </Link>
      </div>

      <form
        onSubmit={handleApplyThreshold}
        className="flex flex-col gap-3 rounded-2xl border border-brand-200/70 bg-white/90 p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="threshold" className="mb-1 block text-xs font-medium text-brand-deep">
            Umbral de stock bajo
          </label>
          <input
            id="threshold"
            type="number"
            min="1"
            step="1"
            value={threshold}
            onChange={(e) => {
              setThreshold(e.target.value);
              setThresholdError('');
            }}
            className="w-full rounded-xl border border-brand-200 px-3 py-2 text-sm outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25 sm:max-w-xs"
          />
          {thresholdError && <p className="mt-1.5 text-sm text-red-600">{thresholdError}</p>}
        </div>
        <button
          type="submit"
          className="rounded-xl border border-brand-200 px-4 py-2 text-sm font-medium text-brand-deep transition hover:border-brand-purple hover:bg-brand-50"
        >
          Actualizar
        </button>
      </form>

      <ErrorBanner message={error} onRetry={() => loadAlerts(appliedThreshold)} />

      {loading ? (
        <LoadingBlock message="Cargando alertas..." />
      ) : (
        !error && (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="overflow-hidden rounded-2xl border border-amber-200/80 bg-white/90 shadow-sm">
              <div className="border-b border-amber-100 bg-amber-50/80 px-4 py-3">
                <h2 className="font-semibold text-amber-900">Stock bajo</h2>
                <p className="text-xs text-amber-800/80">
                  Existencia entre 1 y {appliedThreshold} · {lowStock.length} producto
                  {lowStock.length === 1 ? '' : 's'}
                </p>
              </div>
              <ProductAlertList
                products={lowStock}
                emptyMessage="No hay productos con stock bajo."
                accent="amber"
              />
            </section>

            <section className="overflow-hidden rounded-2xl border border-red-200/80 bg-white/90 shadow-sm">
              <div className="border-b border-red-100 bg-red-50/80 px-4 py-3">
                <h2 className="font-semibold text-red-900">Sin stock</h2>
                <p className="text-xs text-red-800/80">
                  Existencia en 0 · {outOfStock.length} producto
                  {outOfStock.length === 1 ? '' : 's'}
                </p>
              </div>
              <ProductAlertList
                products={outOfStock}
                emptyMessage="No hay productos agotados."
                accent="red"
              />
            </section>
          </div>
        )
      )}
    </div>
  );
}
