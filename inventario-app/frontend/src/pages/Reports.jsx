import { useCallback, useEffect, useState } from 'react';
import { reportsApi } from '../api/axios';
import ErrorBanner from '../components/ErrorBanner';
import LoadingBlock from '../components/LoadingBlock';
import { useToastStore } from '../store/toastStore';
import { formatCurrency, formatNumber, getApiErrorMessage } from '../utils/validation';

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-brand-200/70 bg-white/90 px-4 py-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-blue/70">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-brand-deep">{value}</p>
      {hint && <p className="mt-1 text-xs text-brand-blue/65">{hint}</p>}
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-deep">Reportes</h1>
        <p className="mt-1 text-sm text-brand-blue/80">
          Resumen del inventario, distribución por categoría y productos con mayor valor.
        </p>
      </div>

      <ErrorBanner message={error} onRetry={loadReports} />

      {loading ? (
        <LoadingBlock message="Cargando reportes..." />
      ) : (
        !error && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                label="Productos activos"
                value={formatNumber(summary?.totalProductos)}
              />
              <StatCard
                label="Categorías"
                value={formatNumber(summary?.totalCategorias)}
              />
              <StatCard
                label="Existencia total"
                value={formatNumber(summary?.totalExistencia)}
              />
              <StatCard
                label="Valor del inventario"
                value={formatCurrency(summary?.valorInventario)}
              />
              <StatCard
                label="Sin stock"
                value={formatNumber(summary?.productosSinStock)}
                hint="Productos con existencia 0"
              />
              <StatCard
                label="Stock bajo"
                value={formatNumber(summary?.productosStockBajo)}
                hint={`Umbral ≤ ${summary?.umbralStockBajo ?? 5}`}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="overflow-hidden rounded-2xl border border-brand-200/70 bg-white/90 shadow-sm">
                <div className="border-b border-brand-100 px-4 py-3">
                  <h2 className="font-semibold text-brand-deep">Por categoría</h2>
                  <p className="text-xs text-brand-blue/70">Productos, stock y valor agrupados</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-brand-50/80 text-brand-deep">
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
                          <td colSpan={4} className="px-4 py-8 text-center text-brand-blue/70">
                            No hay categorías para mostrar.
                          </td>
                        </tr>
                      ) : (
                        categories.map((row) => (
                          <tr key={row.categoria} className="border-t border-brand-50">
                            <td className="px-4 py-3 font-medium text-brand-deep">{row.categoria}</td>
                            <td className="px-4 py-3">{formatNumber(row.productos)}</td>
                            <td className="px-4 py-3">{formatNumber(row.existencia)}</td>
                            <td className="px-4 py-3">{formatCurrency(row.valor)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-brand-200/70 bg-white/90 shadow-sm">
                <div className="border-b border-brand-100 px-4 py-3">
                  <h2 className="font-semibold text-brand-deep">Top productos</h2>
                  <p className="text-xs text-brand-blue/70">Mayor valor (precio × existencia)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-brand-50/80 text-brand-deep">
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
                          <td colSpan={4} className="px-4 py-8 text-center text-brand-blue/70">
                            No hay productos para mostrar.
                          </td>
                        </tr>
                      ) : (
                        topProducts.map((product, index) => (
                          <tr key={product._id} className="border-t border-brand-50">
                            <td className="px-4 py-3 text-brand-blue/70">{index + 1}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-brand-deep">{product.nombre}</p>
                              <p className="text-xs text-brand-blue/65">{product.categoria}</p>
                            </td>
                            <td className="px-4 py-3">{formatNumber(product.existencia)}</td>
                            <td className="px-4 py-3">{formatCurrency(product.valor)}</td>
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
