const {
  getProducts,
  getMovements,
} = require('../services/inventoryClient');
const { LOW_STOCK_THRESHOLD } = require('./alert.controller');

// GET /reports/categories
// Agrupa productos por categoría: cantidad de productos y suma de existencias.
async function getCategoriesReport(req, res, next) {
  try {
    const productos = await getProducts(req.headers.authorization);

    const porCategoria = {};

    for (const producto of productos) {
      const categoria = producto.categoria || 'Sin categoría';

      if (!porCategoria[categoria]) {
        porCategoria[categoria] = {
          categoria,
          cantidadProductos: 0,
          totalExistencias: 0,
        };
      }

      porCategoria[categoria].cantidadProductos += 1;
      porCategoria[categoria].totalExistencias += producto.existencia || 0;
    }

    const data = Object.values(porCategoria).sort((a, b) =>
      a.categoria.localeCompare(b.categoria)
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

// GET /reports/summary
// Resumen general del inventario calculado en este servicio.
async function getSummaryReport(req, res, next) {
  try {
    const productos = await getProducts(req.headers.authorization);

    const totalProductos = productos.length;
    const totalUnidades = productos.reduce(
      (suma, p) => suma + (p.existencia || 0),
      0
    );
    const productosBajoStock = productos.filter(
      (p) =>
        typeof p.existencia === 'number' &&
        p.existencia > 0 &&
        p.existencia <= LOW_STOCK_THRESHOLD
    ).length;
    const productosAgotados = productos.filter(
      (p) => typeof p.existencia === 'number' && p.existencia === 0
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        totalProductos,
        totalUnidades,
        productosBajoStock,
        productosAgotados,
        threshold: LOW_STOCK_THRESHOLD,
      },
    });
  } catch (error) {
    return next(error);
  }
}

// GET /reports/top-products
// Top 5 más vendidos: agrupa salidas por producto y ordena por cantidad.
async function getTopProductsReport(req, res, next) {
  try {
    const authorization = req.headers.authorization;
    const [movimientos, productos] = await Promise.all([
      getMovements(authorization),
      getProducts(authorization),
    ]);

    const productosPorId = {};
    for (const producto of productos) {
      productosPorId[String(producto._id)] = producto;
    }

    const ventasPorProducto = {};

    for (const movimiento of movimientos) {
      const productoId = String(movimiento.producto);
      if (!ventasPorProducto[productoId]) {
        ventasPorProducto[productoId] = {
          productoId,
          totalSalidas: 0,
        };
      }
      ventasPorProducto[productoId].totalSalidas += movimiento.cantidad || 0;
    }

    const data = Object.values(ventasPorProducto)
      .map((item) => {
        const producto = productosPorId[item.productoId];
        return {
          productoId: item.productoId,
          nombre: producto?.nombre || null,
          categoria: producto?.categoria || null,
          totalSalidas: item.totalSalidas,
        };
      })
      .sort((a, b) => b.totalSalidas - a.totalSalidas)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCategoriesReport,
  getSummaryReport,
  getTopProductsReport,
};
