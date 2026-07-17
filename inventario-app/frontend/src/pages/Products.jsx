import { useEffect, useState } from 'react';
import { inventoryApi } from '../api/axios';
import { useToastStore } from '../store/toastStore';
import { getApiErrorMessage } from '../utils/validation';

const emptyForm = {
  nombre: '',
  categoria: '',
  precio: '',
  existencia: '0',
};

function formatPrice(value) {
  return Number(value).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}

export default function Products() {
  const showToast = useToastStore((state) => state.showToast);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nombreQuery, setNombreQuery] = useState('');
  const [categoriaQuery, setCategoriaQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  async function loadProducts(filters = {}) {
    setLoading(true);
    try {
      const params = {};
      if (filters.nombre?.trim()) params.nombre = filters.nombre.trim();
      if (filters.categoria?.trim()) params.categoria = filters.categoria.trim();

      const { data } = await inventoryApi.get('/products', { params });
      setProducts(data.data ?? []);
    } catch (error) {
      showToast(getApiErrorMessage(error, 'No se pudieron cargar los productos'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function openCreateModal() {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditing(product);
    setForm({
      nombre: product.nombre ?? '',
      categoria: product.categoria ?? '',
      precio: String(product.precio ?? ''),
      existencia: String(product.existencia ?? 0),
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validateForm() {
    const next = {};
    if (!form.nombre.trim()) next.nombre = 'El nombre es obligatorio';
    if (!form.categoria.trim()) next.categoria = 'La categoría es obligatoria';

    const precio = Number(form.precio);
    if (form.precio === '' || Number.isNaN(precio) || precio < 0) {
      next.precio = 'El precio debe ser un número mayor o igual a 0';
    }

    const existencia = Number(form.existencia);
    if (form.existencia === '' || Number.isNaN(existencia) || existencia < 0) {
      next.existencia = 'La existencia debe ser un número mayor o igual a 0';
    }

    setFormErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    const payload = {
      nombre: form.nombre.trim(),
      categoria: form.categoria.trim(),
      precio: Number(form.precio),
      existencia: Number(form.existencia),
    };

    try {
      if (editing) {
        await inventoryApi.put(`/products/${editing._id}`, payload);
        showToast('Producto actualizado correctamente', 'success');
      } else {
        await inventoryApi.post('/products', payload);
        showToast('Producto creado correctamente', 'success');
      }
      closeModal();
      await loadProducts({ nombre: nombreQuery, categoria: categoriaQuery });
    } catch (error) {
      showToast(getApiErrorMessage(error, 'No se pudo guardar el producto'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `¿Eliminar el producto "${product.nombre}"? Esta acción lo marcará como inactivo.`,
    );
    if (!confirmed) return;

    try {
      await inventoryApi.delete(`/products/${product._id}`);
      showToast('Producto eliminado correctamente', 'success');
      await loadProducts({ nombre: nombreQuery, categoria: categoriaQuery });
    } catch (error) {
      showToast(getApiErrorMessage(error, 'No se pudo eliminar el producto'));
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    loadProducts({ nombre: nombreQuery, categoria: categoriaQuery });
  }

  function handleClearSearch() {
    setNombreQuery('');
    setCategoriaQuery('');
    loadProducts();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-deep">Productos</h1>
          <p className="mt-1 text-sm text-brand-blue/80">
            Consulta, crea, edita y elimina productos del inventario.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-purple/25 transition hover:from-brand-purple hover:to-brand-deep"
        >
          Nuevo producto
        </button>
      </div>

      <form
        onSubmit={handleSearch}
        className="grid gap-3 rounded-2xl border border-brand-200/70 bg-white/90 p-4 sm:grid-cols-[1fr_1fr_auto_auto]"
      >
        <div>
          <label htmlFor="nombreQuery" className="mb-1 block text-xs font-medium text-brand-deep">
            Buscar por nombre
          </label>
          <input
            id="nombreQuery"
            value={nombreQuery}
            onChange={(e) => setNombreQuery(e.target.value)}
            className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25"
            placeholder="Ej. laptop"
          />
        </div>
        <div>
          <label htmlFor="categoriaQuery" className="mb-1 block text-xs font-medium text-brand-deep">
            Buscar por categoría
          </label>
          <input
            id="categoriaQuery"
            value={categoriaQuery}
            onChange={(e) => setCategoriaQuery(e.target.value)}
            className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25"
            placeholder="Ej. electrónicos"
          />
        </div>
        <button
          type="submit"
          className="self-end rounded-xl border border-brand-200 px-4 py-2 text-sm font-medium text-brand-deep transition hover:border-brand-purple hover:bg-brand-50"
        >
          Buscar
        </button>
        <button
          type="button"
          onClick={handleClearSearch}
          className="self-end rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-brand-blue/80 transition hover:text-brand-purple"
        >
          Limpiar
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-brand-200/70 bg-white/90 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-brand-100 bg-brand-50/80 text-brand-deep">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Precio</th>
                <th className="px-4 py-3 font-semibold">Existencia</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-brand-blue/70">
                    Cargando productos...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-brand-blue/70">
                    No hay productos para mostrar.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-b border-brand-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-brand-deep">{product.nombre}</td>
                    <td className="px-4 py-3 text-brand-blue/90">{product.categoria}</td>
                    <td className="px-4 py-3 text-brand-blue/90">{formatPrice(product.precio)}</td>
                    <td className="px-4 py-3 text-brand-blue/90">{product.existencia}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="rounded-lg border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-deep transition hover:border-brand-purple hover:bg-brand-50"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-brand-deep/40 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            className="w-full max-w-md rounded-2xl border border-brand-200/70 bg-white p-6 shadow-xl"
          >
            <h2 id="product-modal-title" className="text-lg font-semibold text-brand-deep">
              {editing ? 'Editar producto' : 'Nuevo producto'}
            </h2>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-brand-deep">
                  Nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25"
                />
                {formErrors.nombre && (
                  <p className="mt-1.5 text-sm text-red-600">{formErrors.nombre}</p>
                )}
              </div>

              <div>
                <label htmlFor="categoria" className="mb-1.5 block text-sm font-medium text-brand-deep">
                  Categoría
                </label>
                <input
                  id="categoria"
                  name="categoria"
                  value={form.categoria}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25"
                />
                {formErrors.categoria && (
                  <p className="mt-1.5 text-sm text-red-600">{formErrors.categoria}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="precio" className="mb-1.5 block text-sm font-medium text-brand-deep">
                    Precio
                  </label>
                  <input
                    id="precio"
                    name="precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25"
                  />
                  {formErrors.precio && (
                    <p className="mt-1.5 text-sm text-red-600">{formErrors.precio}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="existencia" className="mb-1.5 block text-sm font-medium text-brand-deep">
                    Existencia
                  </label>
                  <input
                    id="existencia"
                    name="existencia"
                    type="number"
                    min="0"
                    step="1"
                    value={form.existencia}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25"
                  />
                  {formErrors.existencia && (
                    <p className="mt-1.5 text-sm text-red-600">{formErrors.existencia}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-brand-200 px-4 py-2 text-sm font-medium text-brand-deep transition hover:bg-brand-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
