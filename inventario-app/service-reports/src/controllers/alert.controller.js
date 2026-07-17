const { getProducts } = require('../services/inventoryClient');

// Umbral configurable: productos con existencia <= este valor se consideran
// stock bajo. Por defecto 5.
const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 5;

// GET /alerts/low-stock
// Consulta los productos de service-inventory y filtra en ESTE servicio
// los que tienen existencia baja. Así se demuestra lógica propia, no solo proxy.
async function getLowStockAlerts(req, res, next) {
  try {
    const productos = await getProducts(req.headers.authorization);

    const alertas = productos.filter(
      (producto) =>
        typeof producto.existencia === 'number' &&
        producto.existencia <= LOW_STOCK_THRESHOLD
    );

    return res.status(200).json({
      success: true,
      threshold: LOW_STOCK_THRESHOLD,
      data: alertas,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getLowStockAlerts };
