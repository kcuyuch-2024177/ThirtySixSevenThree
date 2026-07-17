import { motion } from 'framer-motion';
import { ArrowDownToLine, ArrowUpFromLine, PackagePlus } from 'lucide-react';
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

const inputClass =
  'w-full rounded-xl border border-[#8280F7]/25 bg-[#36084D]/55 px-3.5 py-2.5 text-sm text-[#F1F0FF] outline-none transition focus:border-[#A785EF] focus:ring-2 focus:ring-[#A785EF]/30';

const labelClass = 'mb-1.5 block text-sm font-medium text-[#A785EF]';

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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-[#F1F0FF]">Movimientos</h1>
        <p className="mt-1 text-sm text-[#A785EF]/90">
          Registra entradas y salidas de inventario. El stock se actualiza al instante.
        </p>
      </motion.div>

      <ErrorBanner message={productsError} onRetry={loadProducts} />

      {loadingProducts ? (
        <LoadingBlock message="Cargando productos..." />
      ) : (
        !productsError && (
          <>
            {products.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#8280F7]/30 bg-[#5411AE]/15 px-4 py-8 text-center text-sm text-[#A785EF] backdrop-blur-md">
                No hay productos activos.{' '}
                <Link to="/productos" className="font-semibold text-[#8280F7] hover:underline">
                  Crea uno primero
                </Link>
                .
              </div>
            )}

            {lastResult && (
              <motion.div
                className="rounded-2xl border border-[#7DDFC5]/30 bg-[#1a4a4a]/40 px-4 py-3 text-sm text-[#B8F0E0] backdrop-blur-md"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Última operación: <strong>{lastResult.tipo}</strong> de{' '}
                <strong>{lastResult.cantidad}</strong> en <strong>{lastResult.nombre}</strong>. Stock
                actual: <strong>{lastResult.existencia}</strong>.
              </motion.div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <motion.form
                onSubmit={handleEntrySubmit}
                className="rounded-3xl border border-[#8280F7]/25 bg-[#5411AE]/10 p-6 backdrop-blur-md"
                noValidate
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B5897]/50 text-[#B8C8E8]">
                    <ArrowDownToLine className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-semibold text-[#F1F0FF]">Registrar entrada</h2>
                </div>
                <p className="text-sm text-[#A785EF]/80">Incrementa la existencia del producto.</p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="entry-producto" className={labelClass}>
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
                      className={inputClass}
                    >
                      <option value="">Selecciona un producto</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.nombre} (stock: {product.existencia})
                        </option>
                      ))}
                    </select>
                    {entryErrors.productoId && (
                      <p className="mt-1.5 text-sm text-[#FF8FA3]">{entryErrors.productoId}</p>
                    )}
                    {selectedEntry && (
                      <p className="mt-1.5 text-xs text-[#A785EF]/75">
                        Stock actual: {selectedEntry.existencia}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="entry-cantidad" className={labelClass}>
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
                      className={inputClass}
                    />
                    {entryErrors.cantidad && (
                      <p className="mt-1.5 text-sm text-[#FF8FA3]">{entryErrors.cantidad}</p>
                    )}
                  </div>

                  {entrySubmitError && (
                    <div className="rounded-xl border border-[#FF8FA3]/35 bg-[#5c1a2a]/40 px-3 py-2 text-sm text-[#FF8FA3]">
                      {entrySubmitError}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={entryLoading || products.length === 0}
                    className="w-full rounded-xl bg-gradient-to-r from-[#3B5897] to-[#5411AE] px-4 py-3 text-sm font-semibold text-[#F1F0FF] disabled:cursor-not-allowed disabled:opacity-60"
                    whileHover={entryLoading ? undefined : { scale: 1.02, filter: 'brightness(1.08)' }}
                    whileTap={entryLoading ? undefined : { scale: 0.98 }}
                  >
                    {entryLoading ? 'Registrando...' : 'Registrar entrada'}
                  </motion.button>
                </div>
              </motion.form>

              <motion.form
                onSubmit={handleOutputSubmit}
                className="rounded-3xl border border-[#8280F7]/25 bg-[#36084D]/40 p-6 backdrop-blur-md"
                noValidate
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5411AE]/50 text-[#C9B0F5]">
                    <ArrowUpFromLine className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-semibold text-[#F1F0FF]">Registrar salida</h2>
                </div>
                <p className="text-sm text-[#A785EF]/80">Decrementa la existencia del producto.</p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="output-producto" className={labelClass}>
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
                      className={inputClass}
                    >
                      <option value="">Selecciona un producto</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.nombre} (stock: {product.existencia})
                        </option>
                      ))}
                    </select>
                    {outputErrors.productoId && (
                      <p className="mt-1.5 text-sm text-[#FF8FA3]">{outputErrors.productoId}</p>
                    )}
                    {selectedOutput && (
                      <p className="mt-1.5 text-xs text-[#A785EF]/75">
                        Stock actual: {selectedOutput.existencia}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="output-cantidad" className={labelClass}>
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
                      className={inputClass}
                    />
                    {outputErrors.cantidad && (
                      <p className="mt-1.5 text-sm text-[#FF8FA3]">{outputErrors.cantidad}</p>
                    )}
                  </div>

                  {outputSubmitError && (
                    <div className="rounded-xl border border-[#FF8FA3]/35 bg-[#5c1a2a]/40 px-3 py-2 text-sm text-[#FF8FA3]">
                      {outputSubmitError}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={outputLoading || products.length === 0}
                    className="w-full rounded-xl border border-[#8280F7] bg-transparent px-4 py-3 text-sm font-semibold text-[#F1F0FF] transition hover:bg-[#8280F7]/15 disabled:cursor-not-allowed disabled:opacity-60"
                    whileHover={outputLoading ? undefined : { scale: 1.02 }}
                    whileTap={outputLoading ? undefined : { scale: 0.98 }}
                  >
                    {outputLoading ? 'Registrando...' : 'Registrar salida'}
                  </motion.button>
                </div>
              </motion.form>
            </div>

            {products.length > 0 && (
              <p className="flex items-center gap-2 text-xs text-[#A785EF]/70">
                <PackagePlus className="h-3.5 w-3.5" />
                {products.length} producto{products.length === 1 ? '' : 's'} disponibles
              </p>
            )}
          </>
        )
      )}
    </div>
  );
}
