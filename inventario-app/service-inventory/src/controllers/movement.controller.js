const mongoose = require('mongoose');

const Producto = require('../models/product.model');
const Movimiento = require('../models/movement.model');
const { createError } = require('../middlewares/errorHandler');

// Valida productoId y cantidad. Devuelve { error } o { productoId, cantidad }.
function validarProductoYCantidad(productoId, cantidad) {
  if (!productoId || !mongoose.Types.ObjectId.isValid(productoId)) {
    return {
      error: createError(400, 'El productoId es obligatorio y debe ser un id válido'),
    };
  }

  if (typeof cantidad !== 'number' || !Number.isFinite(cantidad) || cantidad <= 0) {
    return {
      error: createError(400, 'La cantidad debe ser un número positivo'),
    };
  }

  return { productoId, cantidad };
}

// POST /entries
// Registra una entrada de inventario: crea un Movimiento tipo "entrada"
// y suma la cantidad al stock del producto con $inc.
async function createEntry(req, res, next) {
  try {
    const validacion = validarProductoYCantidad(req.body.productoId, req.body.cantidad);
    if (validacion.error) return next(validacion.error);

    const { productoId, cantidad } = validacion;

    const productoExistente = await Producto.findOne({ _id: productoId, activo: true });
    if (!productoExistente) {
      return next(createError(404, 'Producto no encontrado'));
    }

    const productoActualizado = await Producto.findByIdAndUpdate(
      productoId,
      { $inc: { existencia: cantidad } },
      { new: true }
    );

    const movimiento = await Movimiento.create({
      producto: productoId,
      tipo: 'entrada',
      cantidad,
    });

    return res.status(201).json({
      success: true,
      data: {
        movimiento,
        producto: productoActualizado,
      },
    });
  } catch (error) {
    return next(error);
  }
}

// POST /outputs
// Registra una salida: valida stock suficiente, crea un Movimiento tipo
// "salida" y resta la cantidad con $inc.
async function createOutput(req, res, next) {
  try {
    const validacion = validarProductoYCantidad(req.body.productoId, req.body.cantidad);
    if (validacion.error) return next(validacion.error);

    const { productoId, cantidad } = validacion;

    const productoExistente = await Producto.findOne({ _id: productoId, activo: true });
    if (!productoExistente) {
      return next(createError(404, 'Producto no encontrado'));
    }

    if (productoExistente.existencia < cantidad) {
      return next(createError(400, 'stock insuficiente'));
    }

    const productoActualizado = await Producto.findByIdAndUpdate(
      productoId,
      { $inc: { existencia: -cantidad } },
      { new: true }
    );

    const movimiento = await Movimiento.create({
      producto: productoId,
      tipo: 'salida',
      cantidad,
    });

    return res.status(201).json({
      success: true,
      data: {
        movimiento,
        producto: productoActualizado,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createEntry, createOutput };
