import { useEffect, useState } from 'react';
import { inventoryApi } from '../api/axios';
import { useToastStore } from '../store/toastStore';
import { getApiErrorMessage } from '../utils/validation';

const emptyMovement = {
  productoId: '',
  cantidad: '',
};

export default function Movements() {
  const showToast = useToastStore((state) => state.showToast);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [entryForm, setEntryForm] = useState(emptyMovement);
  const [outputForm, setOutputForm] = useState(emptyMovement);
  const [entryErrors, setEntryErrors] = useState({});
  const [outputErrors, setOutputErrors] = useState({});
  const [entryLoading, setEntryLoading] = useState(false);
  const [outputLoading, setOutputLoading] = useState(false);

  const [lastResult, setLastResult] = useState(null);

  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const { data } = await inventoryApi.get('/products');
      setProducts(data.data ?? []);
    } catch (error) {
      showToast(getApiErrorMessage(error, 'No se pudieron cargar los productos'));
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function updateProductInList(updated) {
    setProducts((prev) =>
      prev.map((product) => (product._id === updated._id ? updated : product)),
    );
  }

  function validateMovement(form) {
    const next = {};
    if (!form.productoId) next.productoId = 'Selecciona un producto';

    const cantidad = Number(form.cantidad);
    if (!form.cantidad || Number.isNaN(cantidad) || !Number.isInteger(cantidad) || cantidad < 1) {
      next.cantidad = 'La cantidad debe ser un entero mayor a 0';
    }

    return next;
  }

  async function handleEntrySubmit(event) {
    event.preventDefault();
    const nextErrors = validateMovement(entryForm);
    setEntryErrors(nextErrors);
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
      showToast(getApiErrorMessage(error, 'No se pudo registrar la entrada'));
    } finally {
      setEntryLoading(false);
    }
  }

  async function handleOutputSubmit(event) {
    event.preventDefault();
    const nextErrors = validateMovement(outputForm);
    setOutputErrors(nextErrors);
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
      showToast(getApiErrorMessage(error, 'No se pudo registrar la salida'));
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
          <p className="mt-1 text-sm text-brand-blue/75">Incrementa la existencia del producto.</p>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="entry-producto" className="mb-1.5 block text-sm font-medium text-brand-deep">
                Producto
              </label>
              <select
                id="entry-producto"
                value={entryForm.productoId}
                disabled={loadingProducts}
                onChange={(e) => {
                  setEntryForm((prev) => ({ ...prev, productoId: e.target.value }));
                  setEntryErrors((prev) => ({ ...prev, productoId: '' }));
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
              <label htmlFor="entry-cantidad" className="mb-1.5 block text-sm font-medium text-brand-deep">
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
                }}
                className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25"
              />
              {entryErrors.cantidad && (
                <p className="mt-1.5 text-sm text-red-600">{entryErrors.cantidad}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={entryLoading || loadingProducts}
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
          <p className="mt-1 text-sm text-brand-blue/75">Decrementa la existencia del producto.</p>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="output-producto" className="mb-1.5 block text-sm font-medium text-brand-deep">
                Producto
              </label>
              <select
                id="output-producto"
                value={outputForm.productoId}
                disabled={loadingProducts}
                onChange={(e) => {
                  setOutputForm((prev) => ({ ...prev, productoId: e.target.value }));
                  setOutputErrors((prev) => ({ ...prev, productoId: '' }));
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
              <label htmlFor="output-cantidad" className="mb-1.5 block text-sm font-medium text-brand-deep">
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
                }}
                className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25"
              />
              {outputErrors.cantidad && (
                <p className="mt-1.5 text-sm text-red-600">{outputErrors.cantidad}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={outputLoading || loadingProducts}
              className="w-full rounded-xl border border-brand-purple bg-white px-4 py-2.5 text-sm font-semibold text-brand-purple transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {outputLoading ? 'Registrando...' : 'Registrar salida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
