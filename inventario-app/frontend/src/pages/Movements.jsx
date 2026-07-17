import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { inventoryApi } from '../api/axios';
import ErrorBanner from '../components/ErrorBanner';
import LoadingBlock from '../components/LoadingBlock';
import { useToastStore } from '../store/toastStore';
import { getApiErrorMessage, validateMovement } from '../utils/validation';

const emptyMovement = {
  productoId: '',
  cantidad: '',
};

export default function Movements() {
  const showToast = useToastStore((state) => state.showToast);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');

  const [entryForm, setEntryForm] = useState(emptyMovement);
  const [outputForm, setOutputForm] = useState(emptyMovement);
  const [entryErrors, setEntryErrors] = useState({});
  const [outputErrors, setOutputErrors] = useState({});
  const [entryLoading, setEntryLoading] = useState(false);
  const [outputLoading, setOutputLoading] = useState(false);
  const [entrySubmitError, setEntrySubmitError] = useState('');
  const [outputSubmitError, setOutputSubmitError] = useState('');

  const [lastResult, setLastResult] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductsError('');

    try {
      const { data } = await inventoryApi.get('/products');
      setProducts(data.data ?? []);
    } catch (error) {
      const message = getApiErrorMessage(error, 'No se pudieron cargar los productos');
      setProductsError(message);
      showToast(message);
    } finally {
      setLoadingProducts(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function updateProductInList(updated) {
    setProducts((prev) =>
      prev.map((product) => (product._id === updated._id ? updated : product)),
    );
  }

  async function handleEntrySubmit(event) {
    event.preventDefault();
    const nextErrors = validateMovement(entryForm);
    setEntryErrors(nextErrors);
    setEntrySubmitError('');
    if (Object.keys(nextErrors).length > 0) return;

    setEntryLoading(true);
    try {
      const { data } = await inventoryApi.post('/entries', {
        productoId: entryForm.productoId,
        cantidad: Number(entryForm.cantidad),
      });

      const producto = data.data?.producto;
      if (producto) {
        updateProductInList(producto);
        setLastResult({
          tipo: 'entrada',
          nombre: producto.nombre,
          cantidad: Number(entryForm.cantidad),
          existencia: producto.existencia,
        });
      }

      showToast('Entrada registrada correctamente', 'success');
      setEntryForm(emptyMovement);
    } catch (error) {
      const message = getApiErrorMessage(error, 'No se pudo registrar la entrada');
      setEntrySubmitError(message);
      showToast(message);
    } finally {
      setEntryLoading(false);
    }
  }

  async function handleOutputSubmit(event) {
    event.preventDefault();
    const nextErrors = validateMovement(outputForm);
    setOutputErrors(nextErrors);
    setOutputSubmitError('');
    if (Object.keys(nextErrors).length > 0) return;

    setOutputLoading(true);
    try {
      const { data } = await inventoryApi.post('/outputs', {
        productoId: outputForm.productoId,
        cantidad: Number(outputForm.cantidad),
      });

      const producto = data.data?.producto;
      if (producto) {
        updateProductInList(producto);
        setLastResult({
          tipo: 'salida',
          nombre: producto.nombre,
          cantidad: Number(outputForm.cantidad),
          existencia: producto.existencia,
        });
      }

      showToast('Salida registrada correctamente', 'success');
      setOutputForm(emptyMovement);
    } catch (error) {
      const message = getApiErrorMessage(error, 'No se pudo registrar la salida');
      setOutputSubmitError(message);
      showToast(message);
    } finally {
      setOutputLoading(false);
    }
  }

  const selectedEntry = products.find((p) => p._id === entryForm.productoId);
  const selectedOutput = products.find((p) => p._id === outputForm.productoId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-deep">Movimientos</h1>
        <p className="mt-1 text-sm text-brand-blue/80">
          Registra entradas y salidas de inventario. El stock se actualiza al instante.
        </p>
      </div>

      <ErrorBanner message={productsError} onRetry={loadProducts} />

      {loadingProducts ? (
        <LoadingBlock message="Cargando productos..." />
      ) : (
        !productsError && (
          <>
            {products.length === 0 && (
              <div className="rounded-2xl border border-dashed border-brand-300 bg-white/80 px-4 py-8 text-center text-sm text-brand-blue/80">
                No hay productos activos.{' '}
                <Link to="/productos" className="font-semibold text-brand-purple hover:underline">
                  Crea uno primero
                </Link>
                .
              </div>
            )}

            {lastResult && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Última operación: <strong>{lastResult.tipo}</strong> de{' '}
                <strong>{lastResult.cantidad}</strong> en <strong>{lastResult.nombre}</strong>. Stock
                actual: <strong>{lastResult.existencia}</strong>.
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <form
                onSubmit={handleEntrySubmit}
                className="rounded-2xl border border-brand-200/70 bg-white/90 p-5 shadow-sm"
                noValidate
              >
                <h2 className="text-lg font-semibold text-brand-deep">Registrar entrada</h2>
                <p className="mt-1 text-sm text-brand-blue/75">
                  Incrementa la existencia del producto.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="entry-producto"
                      className="mb-1.5 block text-sm font-medium text-brand-deep"
                    >
                      Producto
                    </label>
                    <select
                      id="entry-producto"
                      value={entryForm.productoId}
                      disabled={products.length === 0}
                      onChange={(e) => {
                        setEntryForm((prev) => ({ ...prev, productoId: e.target.value }));
                        setEntryErrors((prev) => ({ ...prev, productoId: '' }));
                        setEntrySubmitError('');
                      }}
                      className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25"
                    >
                      <option value="">Selecciona un producto</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.nombre} (stock: {product.existencia})
                        </option>
                      ))}
                    </select>
                    {entryErrors.productoId && (
                      <p className="mt-1.5 text-sm text-red-600">{entryErrors.productoId}</p>
                    )}
                    {selectedEntry && (
                      <p className="mt-1.5 text-xs text-brand-blue/70">
                        Stock actual: {selectedEntry.existencia}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="entry-cantidad"
                      className="mb-1.5 block text-sm font-medium text-brand-deep"
                    >
                      Cantidad
                    </label>
                    <input
                      id="entry-cantidad"
                      type="number"
                      min="1"
                      step="1"
                      value={entryForm.cantidad}
                      onChange={(e) => {
                        setEntryForm((prev) => ({ ...prev, cantidad: e.target.value }));
                        setEntryErrors((prev) => ({ ...prev, cantidad: '' }));
                        setEntrySubmitError('');
                      }}
                      className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25"
                    />
                    {entryErrors.cantidad && (
                      <p className="mt-1.5 text-sm text-red-600">{entryErrors.cantidad}</p>
                    )}
                  </div>

                  {entrySubmitError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {entrySubmitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={entryLoading || products.length === 0}
                    className="w-full rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {entryLoading ? 'Registrando...' : 'Registrar entrada'}
                  </button>
                </div>
              </form>

              <form
                onSubmit={handleOutputSubmit}
                className="rounded-2xl border border-brand-200/70 bg-white/90 p-5 shadow-sm"
                noValidate
              >
                <h2 className="text-lg font-semibold text-brand-deep">Registrar salida</h2>
                <p className="mt-1 text-sm text-brand-blue/75">
                  Decrementa la existencia del producto.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="output-producto"
                      className="mb-1.5 block text-sm font-medium text-brand-deep"
                    >
                      Producto
                    </label>
                    <select
                      id="output-producto"
                      value={outputForm.productoId}
                      disabled={products.length === 0}
                      onChange={(e) => {
                        setOutputForm((prev) => ({ ...prev, productoId: e.target.value }));
                        setOutputErrors((prev) => ({ ...prev, productoId: '' }));
                        setOutputSubmitError('');
                      }}
                      className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25"
                    >
                      <option value="">Selecciona un producto</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.nombre} (stock: {product.existencia})
                        </option>
                      ))}
                    </select>
                    {outputErrors.productoId && (
                      <p className="mt-1.5 text-sm text-red-600">{outputErrors.productoId}</p>
                    )}
                    {selectedOutput && (
                      <p className="mt-1.5 text-xs text-brand-blue/70">
                        Stock actual: {selectedOutput.existencia}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="output-cantidad"
                      className="mb-1.5 block text-sm font-medium text-brand-deep"
                    >
                      Cantidad
                    </label>
                    <input
                      id="output-cantidad"
                      type="number"
                      min="1"
                      step="1"
                      value={outputForm.cantidad}
                      onChange={(e) => {
                        setOutputForm((prev) => ({ ...prev, cantidad: e.target.value }));
                        setOutputErrors((prev) => ({ ...prev, cantidad: '' }));
                        setOutputSubmitError('');
                      }}
                      className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25"
                    />
                    {outputErrors.cantidad && (
                      <p className="mt-1.5 text-sm text-red-600">{outputErrors.cantidad}</p>
                    )}
                  </div>

                  {outputSubmitError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {outputSubmitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={outputLoading || products.length === 0}
                    className="w-full rounded-xl border border-brand-purple bg-white px-4 py-2.5 text-sm font-semibold text-brand-purple transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {outputLoading ? 'Registrando...' : 'Registrar salida'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )
      )}
    </div>
  );
}
