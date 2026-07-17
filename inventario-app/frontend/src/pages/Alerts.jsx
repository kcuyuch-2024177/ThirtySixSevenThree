import { motion } from 'framer-motion';
import { PackageX, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../api/axios';
import ErrorBanner from '../components/ErrorBanner';
import LoadingBlock from '../components/LoadingBlock';
import { DEFAULT_THRESHOLD, useAlertsStore } from '../store/alertsStore';
import { useToastStore } from '../store/toastStore';
import { formatCurrency, formatNumber, getApiErrorMessage } from '../utils/validation';

const inputClass =
  'w-full rounded-xl border border-[#8280F7]/25 bg-[#36084D]/55 px-3.5 py-2.5 text-sm text-[#F1F0FF] outline-none transition focus:border-[#A785EF] focus:ring-2 focus:ring-[#A785EF]/30 sm:max-w-xs';

const listContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const listItem = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
};

function ProductAlertList({ products, emptyMessage, accent = 'amber' }) {
  if (products.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-[#A785EF]/75">{emptyMessage}</p>;
  }

  const accentBorder =
    accent === 'red' ? 'border-l-[#FF8FA3]/60' : 'border-l-[#FFC48A]/60';

  return (
    <motion.ul
      className="divide-y divide-[#8280F7]/10"
      variants={listContainer}
      initial="hidden"
      animate="show"
    >
      {products.map((product) => (
        <motion.li
          key={product._id}
          variants={listItem}
          className={`border-l-2 px-4 py-3 ${accentBorder} bg-[#36084D]/25`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-[#F1F0FF]">{product.nombre}</p>
              <p className="text-xs text-[#A785EF]/75">{product.categoria}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-[#E6E1FF]">
                Stock: {formatNumber(product.existencia)}
              </p>
              <p className="text-xs text-[#A785EF]/70">{formatCurrency(product.precio)}</p>
            </div>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  );
}

export default function Alerts() {
  const showToast = useToastStore((state) => state.showToast);
  const storedThreshold = useAlertsStore((state) => state.threshold);
  const setStoredThreshold = useAlertsStore((state) => state.setThreshold);

  const [threshold, setThreshold] = useState(String(storedThreshold || DEFAULT_THRESHOLD));
  const [thresholdError, setThresholdError] = useState('');
  const [appliedThreshold, setAppliedThreshold] = useState(storedThreshold || DEFAULT_THRESHOLD);

  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAlerts = useCallback(
    async (nextThreshold = storedThreshold || DEFAULT_THRESHOLD) => {
      setLoading(true);
      setError('');

      try {
        const [lowRes, outRes] = await Promise.all([
          reportsApi.get('/alerts/low-stock', { params: { threshold: nextThreshold } }),
          reportsApi.get('/alerts/out-of-stock'),
        ]);

        setLowStock(lowRes.data.data?.productos ?? []);
        setOutOfStock(outRes.data.data?.productos ?? []);
        const applied = lowRes.data.data?.threshold ?? nextThreshold;
        setAppliedThreshold(applied);
        setStoredThreshold(applied);
      } catch (err) {
        const message = getApiErrorMessage(err, 'No se pudieron cargar las alertas');
        setError(message);
        showToast(message);
      } finally {
        setLoading(false);
      }
    },
    [showToast, setStoredThreshold, storedThreshold],
  );

  useEffect(() => {
    loadAlerts(storedThreshold || DEFAULT_THRESHOLD);
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
    setStoredThreshold(value);
    loadAlerts(value);
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F1F0FF]">Dashboard de alertas</h1>
          <p className="mt-1 text-sm text-[#A785EF]/90">
            Productos con stock bajo o agotado, según el inventario actual.
          </p>
        </div>
        <Link
          to="/movimientos"
          className="text-sm font-semibold text-[#8280F7] hover:text-[#A785EF] hover:underline"
        >
          Ir a movimientos →
        </Link>
      </motion.div>

      <motion.form
        onSubmit={handleApplyThreshold}
        className="flex flex-col gap-3 rounded-2xl border border-[#8280F7]/25 bg-[#5411AE]/10 p-4 backdrop-blur-md sm:flex-row sm:items-end"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex-1">
          <label htmlFor="threshold" className="mb-1 block text-xs font-medium text-[#A785EF]">
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
            className={inputClass}
          />
          {thresholdError && <p className="mt-1.5 text-sm text-[#FF8FA3]">{thresholdError}</p>}
        </div>
        <motion.button
          type="submit"
          className="rounded-xl border border-[#8280F7]/30 bg-[#36084D]/50 px-4 py-2.5 text-sm font-medium text-[#F1F0FF] transition hover:bg-[#5411AE]/35"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Actualizar
        </motion.button>
      </motion.form>

      <ErrorBanner message={error} onRetry={() => loadAlerts(appliedThreshold)} />

      {loading ? (
        <LoadingBlock message="Cargando alertas..." />
      ) : (
        !error && (
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.section
              className="overflow-hidden rounded-3xl border border-[#FFC48A]/25 bg-[#5411AE]/10 backdrop-blur-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <div className="border-b border-[#FFC48A]/20 bg-[#5c3a1a]/35 px-4 py-3">
                <div className="flex items-center gap-2">
                  <TriangleAlert className="h-5 w-5 text-[#FFC48A]" />
                  <h2 className="font-semibold text-[#F1F0FF]">Stock bajo</h2>
                </div>
                <p className="mt-1 text-xs text-[#FFC48A]/90">
                  Existencia entre 1 y {appliedThreshold} · {lowStock.length} producto
                  {lowStock.length === 1 ? '' : 's'}
                </p>
              </div>
              <ProductAlertList
                products={lowStock}
                emptyMessage="No hay productos con stock bajo."
                accent="amber"
              />
            </motion.section>

            <motion.section
              className="overflow-hidden rounded-3xl border border-[#FF8FA3]/25 bg-[#36084D]/40 backdrop-blur-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
            >
              <div className="border-b border-[#FF8FA3]/20 bg-[#5c1a2a]/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <PackageX className="h-5 w-5 text-[#FF8FA3]" />
                  <h2 className="font-semibold text-[#F1F0FF]">Sin stock</h2>
                </div>
                <p className="mt-1 text-xs text-[#FF8FA3]/90">
                  Existencia en 0 · {outOfStock.length} producto
                  {outOfStock.length === 1 ? '' : 's'}
                </p>
              </div>
              <ProductAlertList
                products={outOfStock}
                emptyMessage="No hay productos agotados."
                accent="red"
              />
            </motion.section>
          </div>
        )
      )}
    </div>
  );
}
