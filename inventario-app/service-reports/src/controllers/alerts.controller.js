const { getProducts } = require('../services/inventoryClient');

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

function parseThreshold(value) {
  if (value === undefined || value === null || value === '') {
    return DEFAULT_LOW_STOCK_THRESHOLD;
  }
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isInteger(num) || num < 1) {
    return null;
  }
  return num;
}

// GET /alerts/low-stock?threshold=5
// Productos con existencia > 0 y existencia <= threshold
async function getLowStock(req, res, next) {
  try {
    const threshold = parseThreshold(req.query.threshold);
    if (threshold === null) {
      return res.status(400).json({
        success: false,
        message: 'El umbral (threshold) debe ser un entero mayor o igual a 1',
      });
    }

    const productos = await getProducts(req.headers.authorization);
    const alertas = productos
      .filter((p) => p.existencia > 0 && p.existencia <= threshold)
      .sort((a, b) => a.existencia - b.existencia);

    return res.status(200).json({
      success: true,
      data: {
        threshold,
        total: alertas.length,
        productos: alertas,
      },
    });
  } catch (error) {
    return next(error);
  }
}

// GET /alerts/out-of-stock
// Productos con existencia === 0
async function getOutOfStock(req, res, next) {
  try {
    const productos = await getProducts(req.headers.authorization);
    const alertas = productos
      .filter((p) => p.existencia === 0)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

    return res.status(200).json({
      success: true,
      data: {
        total: alertas.length,
        productos: alertas,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getLowStock, getOutOfStock };
