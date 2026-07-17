const { getProducts } = require('../services/inventoryClient');

const DEFAULT_TOP_LIMIT = 5;
const DEFAULT_LOW_STOCK_THRESHOLD = 5;

function parseLimit(value) {
  if (value === undefined || value === null || value === '') {
    return DEFAULT_TOP_LIMIT;
  }
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isInteger(num) || num < 1) {
    return null;
  }
  return Math.min(num, 50);
}

// GET /reports/summary
async function getSummary(req, res, next) {
  try {
    const productos = await getProducts(req.headers.authorization);
    const categorias = new Set(productos.map((p) => p.categoria));

    const totalExistencia = productos.reduce((sum, p) => sum + (p.existencia || 0), 0);
    const valorInventario = productos.reduce(
      (sum, p) => sum + (p.precio || 0) * (p.existencia || 0),
      0,
    );
    const productosSinStock = productos.filter((p) => p.existencia === 0).length;
    const productosStockBajo = productos.filter(
      (p) => p.existencia > 0 && p.existencia <= DEFAULT_LOW_STOCK_THRESHOLD,
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        totalProductos: productos.length,
        totalCategorias: categorias.size,
        totalExistencia,
        valorInventario,
        productosSinStock,
        productosStockBajo,
        umbralStockBajo: DEFAULT_LOW_STOCK_THRESHOLD,
      },
    });
  } catch (error) {
    return next(error);
  }
}

// GET /reports/categories
async function getCategories(req, res, next) {
  try {
    const productos = await getProducts(req.headers.authorization);
    const byCategory = new Map();

    for (const product of productos) {
      const key = product.categoria || 'Sin categoría';
      const current = byCategory.get(key) || {
        categoria: key,
        productos: 0,
        existencia: 0,
        valor: 0,
      };

      current.productos += 1;
      current.existencia += product.existencia || 0;
      current.valor += (product.precio || 0) * (product.existencia || 0);
      byCategory.set(key, current);
    }

    const data = Array.from(byCategory.values()).sort((a, b) =>
      a.categoria.localeCompare(b.categoria, 'es'),
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

// GET /reports/top-products?limit=5
// Ordenados por valor en inventario (precio * existencia)
async function getTopProducts(req, res, next) {
  try {
    const limit = parseLimit(req.query.limit);
    if (limit === null) {
      return res.status(400).json({
        success: false,
        message: 'El límite (limit) debe ser un entero mayor o igual a 1',
      });
    }

    const productos = await getProducts(req.headers.authorization);
    const ranked = productos
      .map((p) => ({
        _id: p._id,
        nombre: p.nombre,
        categoria: p.categoria,
        precio: p.precio,
        existencia: p.existencia,
        valor: (p.precio || 0) * (p.existencia || 0),
      }))
      .sort((a, b) => b.valor - a.valor || b.existencia - a.existencia)
      .slice(0, limit);

    return res.status(200).json({
      success: true,
      data: {
        limit,
        productos: ranked,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getSummary, getCategories, getTopProducts };
