import { animate, motion, useMotionValue } from 'framer-motion';
import {
  AlertTriangle,
  Boxes,
  FolderTree,
  Package,
  PackageX,
  Wallet,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { reportsApi } from '../api/axios';
import ErrorBanner from '../components/ErrorBanner';
import LoadingBlock from '../components/LoadingBlock';
import { useToastStore } from '../store/toastStore';
import { formatCurrency, formatNumber, getApiErrorMessage } from '../utils/validation';

const PASTEL = ['#7B93C4', '#8A5BC8', '#B8A0F0', '#A5A3F9', '#9B7BC8', '#6E8AB8'];

function useCountUp(target, duration = 1.1) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const numeric = Number(target) || 0;
    const controls = animate(motionValue, numeric, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [target, duration, motionValue]);

  return display;
}

function CountText({ value, format = 'number', className = '' }) {
  const counted = useCountUp(value);
  const text =
    format === 'currency'
      ? formatCurrency(counted)
      : formatNumber(Math.round(counted));

  return <span className={className}>{text}</span>;
}

function StatCard({ label, value, hint, icon: Icon, accent, format = 'number', delay = 0 }) {
  return (
    <motion.div
      className="rounded-2xl border border-[#8280F7]/25 bg-[#5411AE]/10 px-4 py-5 backdrop-blur-md"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#A785EF]/85">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-[#F1F0FF]">
            <CountText value={value} format={format} />
          </p>
          {hint && <p className="mt-1 text-xs text-[#A785EF]/70">{hint}</p>}
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accent}55`, color: accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function ChartTooltip({ active, payload, label, valuePrefix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#8280F7]/30 bg-[#36084D]/95 px-3 py-2 text-xs text-[#F1F0FF] shadow-lg backdrop-blur-md">
      <p className="font-medium text-[#A785EF]">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="mt-0.5">
          {entry.name}: {valuePrefix}
          {typeof entry.value === 'number' ? formatNumber(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

export default function Reports() {
  const showToast = useToastStore((state) => state.showToast);

  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [summaryRes, categoriesRes, topRes] = await Promise.all([
        reportsApi.get('/reports/summary'),
        reportsApi.get('/reports/categories'),
        reportsApi.get('/reports/top-products', { params: { limit: 5 } }),
      ]);

      setSummary(summaryRes.data.data ?? null);
      setCategories(categoriesRes.data.data ?? []);
      setTopProducts(topRes.data.data?.productos ?? []);
    } catch (err) {
      const message = getApiErrorMessage(err, 'No se pudieron cargar los reportes');
      setError(message);
      showToast(message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const barData = categories.map((c) => ({
    name: c.categoria,
    valor: Math.round(c.valor || 0),
  }));

  const pieData = categories
    .filter((c) => (c.existencia || 0) > 0)
    .map((c) => ({
      name: c.categoria,
      value: c.existencia || 0,
    }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-[#F1F0FF]">Reportes</h1>
        <p className="mt-1 text-sm text-[#A785EF]/90">
          Resumen del inventario, distribución por categoría y productos con mayor valor.
        </p>
      </motion.div>

      <ErrorBanner message={error} onRetry={loadReports} />

      {loading ? (
        <LoadingBlock message="Cargando reportes..." />
      ) : (
        !error && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                label="Productos activos"
                value={summary?.totalProductos}
                icon={Package}
                accent="#7B93C4"
                delay={0}
              />
              <StatCard
                label="Categorías"
                value={summary?.totalCategorias}
                icon={FolderTree}
                accent="#8A5BC8"
                delay={0.05}
              />
              <StatCard
                label="Existencia total"
                value={summary?.totalExistencia}
                icon={Boxes}
                accent="#B8A0F0"
                delay={0.1}
              />
              <StatCard
                label="Valor del inventario"
                value={summary?.valorInventario}
                format="currency"
                icon={Wallet}
                accent="#A5A3F9"
                delay={0.15}
              />
              <StatCard
                label="Sin stock"
                value={summary?.productosSinStock}
                hint="Productos con existencia 0"
                icon={PackageX}
                accent="#FF8FA3"
                delay={0.2}
              />
              <StatCard
                label="Stock bajo"
                value={summary?.productosStockBajo}
                hint={`Umbral ≤ ${summary?.umbralStockBajo ?? 5}`}
                icon={AlertTriangle}
                accent="#FFC48A"
                delay={0.25}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <motion.section
                className="rounded-3xl border border-[#8280F7]/25 bg-[#5411AE]/10 p-4 backdrop-blur-md sm:p-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-semibold text-[#F1F0FF]">Valor por categoría</h2>
                <p className="mb-4 text-xs text-[#A785EF]/75">Barras con tonos pastel de la marca</p>
                <div className="h-64 w-full">
                  {barData.length === 0 ? (
                    <p className="flex h-full items-center justify-center text-sm text-[#A785EF]/70">
                      Sin datos para graficar.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                        <CartesianGrid stroke="rgba(130,128,247,0.15)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: '#A785EF', fontSize: 11 }}
                          axisLine={{ stroke: 'rgba(130,128,247,0.25)' }}
                          tickLine={false}
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis
                          tick={{ fill: '#A785EF', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          content={<ChartTooltip valuePrefix="$" />}
                          cursor={{ fill: 'rgba(84,17,174,0.2)' }}
                        />
                        <Bar dataKey="valor" name="Valor" radius={[8, 8, 0, 0]}>
                          {barData.map((_, index) => (
                            <Cell key={index} fill={PASTEL[index % PASTEL.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.section>

              <motion.section
                className="rounded-3xl border border-[#8280F7]/25 bg-[#36084D]/40 p-4 backdrop-blur-md sm:p-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                <h2 className="font-semibold text-[#F1F0FF]">Existencia por categoría</h2>
                <p className="mb-4 text-xs text-[#A785EF]/75">Distribución del stock</p>
                <div className="h-64 w-full">
                  {pieData.length === 0 ? (
                    <p className="flex h-full items-center justify-center text-sm text-[#A785EF]/70">
                      Sin datos para graficar.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={PASTEL[index % PASTEL.length]} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.section>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="overflow-hidden rounded-3xl border border-[#8280F7]/25 bg-[#5411AE]/10 backdrop-blur-md">
                <div className="border-b border-[#8280F7]/15 px-4 py-3">
                  <h2 className="font-semibold text-[#F1F0FF]">Por categoría</h2>
                  <p className="text-xs text-[#A785EF]/75">Productos, stock y valor agrupados</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[#36084D]/50 text-[#A785EF]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Categoría</th>
                        <th className="px-4 py-3 font-semibold">Productos</th>
                        <th className="px-4 py-3 font-semibold">Existencia</th>
                        <th className="px-4 py-3 font-semibold">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-[#A785EF]/70">
                            No hay categorías para mostrar.
                          </td>
                        </tr>
                      ) : (
                        categories.map((row, index) => (
                          <tr
                            key={row.categoria}
                            className={`border-t border-[#8280F7]/10 transition hover:bg-[#5411AE]/25 ${
                              index % 2 === 0 ? 'bg-[#36084D]/20' : 'bg-[#5411AE]/10'
                            }`}
                          >
                            <td className="px-4 py-3 font-medium text-[#F1F0FF]">{row.categoria}</td>
                            <td className="px-4 py-3 text-[#E6E1FF]">{formatNumber(row.productos)}</td>
                            <td className="px-4 py-3 text-[#E6E1FF]">{formatNumber(row.existencia)}</td>
                            <td className="px-4 py-3 text-[#E6E1FF]">{formatCurrency(row.valor)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="overflow-hidden rounded-3xl border border-[#8280F7]/25 bg-[#36084D]/40 backdrop-blur-md">
                <div className="border-b border-[#8280F7]/15 px-4 py-3">
                  <h2 className="font-semibold text-[#F1F0FF]">Top productos</h2>
                  <p className="text-xs text-[#A785EF]/75">Mayor valor (precio × existencia)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[#36084D]/50 text-[#A785EF]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">#</th>
                        <th className="px-4 py-3 font-semibold">Producto</th>
                        <th className="px-4 py-3 font-semibold">Stock</th>
                        <th className="px-4 py-3 font-semibold">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-[#A785EF]/70">
                            No hay productos para mostrar.
                          </td>
                        </tr>
                      ) : (
                        topProducts.map((product, index) => (
                          <tr
                            key={product._id}
                            className={`border-t border-[#8280F7]/10 transition hover:bg-[#5411AE]/25 ${
                              index % 2 === 0 ? 'bg-[#36084D]/20' : 'bg-[#5411AE]/10'
                            }`}
                          >
                            <td className="px-4 py-3 text-[#A785EF]/80">{index + 1}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-[#F1F0FF]">{product.nombre}</p>
                              <p className="text-xs text-[#A785EF]/70">{product.categoria}</p>
                            </td>
                            <td className="px-4 py-3 text-[#E6E1FF]">
                              {formatNumber(product.existencia)}
                            </td>
                            <td className="px-4 py-3 text-[#E6E1FF]">
                              {formatCurrency(product.valor)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </>
        )
      )}
    </div>
  );
}
