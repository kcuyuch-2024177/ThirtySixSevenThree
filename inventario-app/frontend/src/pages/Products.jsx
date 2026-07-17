import { AnimatePresence, motion } from 'framer-motion';
import { PackageOpen, PackageX, Pencil, Plus, Search, Trash2, TriangleAlert, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { inventoryApi } from '../api/axios';
import ErrorBanner from '../components/ErrorBanner';
import LoadingBlock from '../components/LoadingBlock';
import { useAlertsStore } from '../store/alertsStore';
import { useToastStore } from '../store/toastStore';
import {
  formatCurrency,
  getApiErrorMessage,
  validateProduct,
  validateProductSearch,
} from '../utils/validation';

const emptyForm = {
  nombre: '',
  categoria: '',
  precio: '',
  existencia: '0',
};

const CATEGORY_COLORS = ['#3B5897', '#5411AE', '#A785EF', '#8280F7', '#36084D'];

const inputClass =
  'w-full rounded-xl border border-[#8280F7]/25 bg-[#36084D]/55 px-3.5 py-2.5 text-sm text-[#E8E0FF] placeholder:text-[#A785EF]/50 outline-none transition focus:border-[#A785EF] focus:ring-2 focus:ring-[#A785EF]/30';

function categoryColor(categoria = '') {
  let hash = 0;
  for (let i = 0; i < categoria.length; i += 1) {
    hash = categoria.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

function stockBadge(existencia, threshold) {
  if (existencia === 0) {
    return {
      label: `Stock · 0`,
      className: 'bg-[#5c1a2a]/80 text-[#FF8FA3] border-[#FF8FA3]/30',
    };
  }
  if (existencia > 0 && existencia <= threshold) {
    return {
      label: `Bajo · ${existencia}`,
      className: 'bg-[#5c3a1a]/70 text-[#FFC48A] border-[#FFC48A]/30',
    };
  }
  return {
    label: `Stock · ${existencia}`,
    className: 'bg-[#1a4a4a]/70 text-[#7DDFC5] border-[#7DDFC5]/30',
  };
}

function AlertCornerBadge({ existencia, threshold }) {
  if (existencia === 0) {
    return (
      <motion.span
        className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-[#FF8FA3]/40 bg-[#5c1a2a]/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#FFB0BE] shadow-lg backdrop-blur-sm"
        animate={{ opacity: [0.75, 1, 0.75], scale: [1, 1.04, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PackageX className="h-3 w-3" />
        Sin stock
      </motion.span>
    );
  }

  if (existencia > 0 && existencia <= threshold) {
    return (
      <motion.span
        className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-[#FFC48A]/40 bg-[#5c3a1a]/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#FFD4A8] shadow-lg backdrop-blur-sm"
        animate={{ opacity: [0.75, 1, 0.75], scale: [1, 1.04, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <TriangleAlert className="h-3 w-3" />
        Stock bajo
      </motion.span>
    );
  }

  return null;
}

const gridContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const gridItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Products() {
  const showToast = useToastStore((state) => state.showToast);
  const threshold = useAlertsStore((state) => state.threshold);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [saving, setSaving] = useState(false);

  const [nombreQuery, setNombreQuery] = useState('');
  const [categoriaQuery, setCategoriaQuery] = useState('');
  const [searchErrors, setSearchErrors] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const loadProducts = useCallback(
    async (filters = {}) => {
      setLoading(true);
      setListError('');

      try {
        const params = {};
        if (filters.nombre?.trim()) params.nombre = filters.nombre.trim();
        if (filters.categoria?.trim()) params.categoria = filters.categoria.trim();

        const { data } = await inventoryApi.get('/products', { params });
        setProducts(data.data ?? []);
      } catch (error) {
        const message = getApiErrorMessage(error, 'No se pudieron cargar los productos');
        setListError(message);
        showToast(message);
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
    if (saving) return;
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

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateProduct(form);
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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
      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);
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
    const nextErrors = validateProductSearch({
      nombre: nombreQuery,
      categoria: categoriaQuery,
    });
    setSearchErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    loadProducts({ nombre: nombreQuery, categoria: categoriaQuery });
  }

  function handleClearSearch() {
    setNombreQuery('');
    setCategoriaQuery('');
    setSearchErrors({});
    loadProducts();
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#E8E0FF]">Productos</h1>
          <p className="mt-1 text-sm text-[#A785EF]/90">
            Consulta, crea, edita y elimina productos del inventario.
          </p>
        </div>
        <motion.button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B5897] to-[#5411AE] px-4 py-2.5 text-sm font-semibold text-[#E8E0FF] shadow-[0_12px_32px_rgba(84,17,174,0.4)]"
          whileHover={{ scale: 1.03, filter: 'brightness(1.08)' }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </motion.button>
      </motion.div>

      <motion.form
        onSubmit={handleSearch}
        className="grid gap-3 rounded-2xl border border-[#8280F7]/25 bg-[#5411AE]/15 p-4 backdrop-blur-md sm:grid-cols-[1fr_1fr_auto_auto]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4 }}
      >
        <div>
          <label htmlFor="nombreQuery" className="mb-1 block text-xs font-medium text-[#A785EF]">
            Buscar por nombre
          </label>
          <input
            id="nombreQuery"
            value={nombreQuery}
            onChange={(e) => {
              setNombreQuery(e.target.value);
              setSearchErrors((prev) => ({ ...prev, nombre: '' }));
            }}
            className={inputClass}
            placeholder="Ej. laptop"
          />
          {searchErrors.nombre && (
            <p className="mt-1.5 text-sm text-[#FF8FA3]">{searchErrors.nombre}</p>
          )}
        </div>
        <div>
          <label htmlFor="categoriaQuery" className="mb-1 block text-xs font-medium text-[#A785EF]">
            Buscar por categoría
          </label>
          <input
            id="categoriaQuery"
            value={categoriaQuery}
            onChange={(e) => {
              setCategoriaQuery(e.target.value);
              setSearchErrors((prev) => ({ ...prev, categoria: '' }));
            }}
            className={inputClass}
            placeholder="Ej. electrónicos"
          />
          {searchErrors.categoria && (
            <p className="mt-1.5 text-sm text-[#FF8FA3]">{searchErrors.categoria}</p>
          )}
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 self-end rounded-xl border border-[#8280F7]/30 bg-[#36084D]/50 px-4 py-2.5 text-sm font-medium text-[#E8E0FF] transition hover:border-[#A785EF]/50 hover:bg-[#5411AE]/30"
        >
          <Search className="h-4 w-4" />
          Buscar
        </button>
        <button
          type="button"
          onClick={handleClearSearch}
          className="inline-flex items-center justify-center gap-1 self-end rounded-xl px-3 py-2.5 text-sm font-medium text-[#A785EF]/80 transition hover:text-[#8280F7]"
        >
          <X className="h-4 w-4" />
          Limpiar
        </button>
      </motion.form>

      <ErrorBanner
        message={listError}
        onRetry={() => loadProducts({ nombre: nombreQuery, categoria: categoriaQuery })}
      />

      {loading ? (
        <LoadingBlock message="Cargando productos..." />
      ) : (
        !listError &&
        (products.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#8280F7]/30 bg-[#5411AE]/10 px-6 py-16 text-center backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#36084D]/60 shadow-[0_0_40px_rgba(130,128,247,0.25)]">
              <PackageOpen className="h-10 w-10 text-[#8280F7]" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-semibold text-[#E8E0FF]">Sin productos</h2>
            <p className="mt-2 max-w-sm text-sm text-[#A785EF]/85">
              No hay resultados para tu búsqueda, o aún no has creado ningún producto.
            </p>
            <motion.button
              type="button"
              onClick={openCreateModal}
              className="mt-6 rounded-xl bg-gradient-to-r from-[#3B5897] to-[#5411AE] px-4 py-2.5 text-sm font-semibold text-[#E8E0FF]"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Crear el primero
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={gridContainer}
            initial="hidden"
            animate="show"
          >
            {products.map((product) => {
              const accent = categoryColor(product.categoria);
              const stock = stockBadge(product.existencia, threshold);

              return (
                <motion.article
                  key={product._id}
                  variants={gridItem}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#8280F7]/20 bg-[#36084D]/40 backdrop-blur-md"
                  whileHover={{
                    y: -5,
                    scale: 1.02,
                    boxShadow: `0 18px 40px ${accent}55`,
                  }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                >
                  <AlertCornerBadge existencia={product.existencia} threshold={threshold} />
                  <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

                  <div className="flex flex-1 flex-col p-4">
                    <span
                      className="mb-3 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#E8E0FF]"
                      style={{ backgroundColor: `${accent}99` }}
                    >
                      {product.categoria}
                    </span>

                    <h2 className="text-lg font-bold leading-snug text-[#E8E0FF]">{product.nombre}</h2>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#8280F7]/35 bg-[#5411AE]/30 px-3 py-1 text-base font-bold text-[#8280F7]">
                        {formatCurrency(product.precio)}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${stock.className}`}
                      >
                        {stock.label}
                      </span>
                    </div>

                    <div className="mt-auto flex justify-end gap-2 pt-5">
                      <motion.button
                        type="button"
                        onClick={() => openEditModal(product)}
                        aria-label={`Editar ${product.nombre}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#8280F7]/25 bg-[#5411AE]/25 text-[#A785EF] transition hover:bg-[#8280F7]/25 hover:text-[#E8E0FF]"
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.92 }}
                      >
                        <Pencil className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => handleDelete(product)}
                        aria-label={`Eliminar ${product.nombre}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#FF8FA3]/25 bg-[#5c1a2a]/40 text-[#FF8FA3] transition hover:bg-[#FF8FA3]/20"
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.92 }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        ))
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-[#36084D]/70 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-modal-title"
              className="w-full max-w-md rounded-3xl border border-[#8280F7]/30 bg-[#36084D]/95 p-6 shadow-[0_24px_80px_rgba(54,8,77,0.65)]"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              <h2 id="product-modal-title" className="text-lg font-semibold text-[#E8E0FF]">
                {editing ? 'Editar producto' : 'Nuevo producto'}
              </h2>

              <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-[#A785EF]">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleFormChange}
                    className={inputClass}
                  />
                  {formErrors.nombre && (
                    <p className="mt-1.5 text-sm text-[#FF8FA3]">{formErrors.nombre}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="categoria" className="mb-1.5 block text-sm font-medium text-[#A785EF]">
                    Categoría
                  </label>
                  <input
                    id="categoria"
                    name="categoria"
                    value={form.categoria}
                    onChange={handleFormChange}
                    className={inputClass}
                  />
                  {formErrors.categoria && (
                    <p className="mt-1.5 text-sm text-[#FF8FA3]">{formErrors.categoria}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="precio" className="mb-1.5 block text-sm font-medium text-[#A785EF]">
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
                      className={inputClass}
                    />
                    {formErrors.precio && (
                      <p className="mt-1.5 text-sm text-[#FF8FA3]">{formErrors.precio}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="existencia"
                      className="mb-1.5 block text-sm font-medium text-[#A785EF]"
                    >
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
                      className={inputClass}
                    />
                    {formErrors.existencia && (
                      <p className="mt-1.5 text-sm text-[#FF8FA3]">{formErrors.existencia}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-xl border border-[#8280F7]/25 px-4 py-2 text-sm font-medium text-[#A785EF] transition hover:bg-[#5411AE]/30 disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-[#3B5897] to-[#5411AE] px-4 py-2 text-sm font-semibold text-[#E8E0FF] disabled:cursor-not-allowed disabled:opacity-60"
                    whileHover={saving ? undefined : { scale: 1.03 }}
                    whileTap={saving ? undefined : { scale: 0.98 }}
                  >
                    {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
