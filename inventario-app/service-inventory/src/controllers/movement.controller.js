const mongoose = require('mongoose');

const Movimiento = require('../models/movement.model');
const Producto = require('../models/product.model');

function toPositiveInteger(value) {
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num) || !Number.isInteger(num) || num < 1) return null;
  return num;
}

async function registerMovement(tipo, req, res, next) {
  try {
    const productoId = req.body.productoId || req.body.producto;
    const { cantidad } = req.body;

    if (!productoId || !mongoose.Types.ObjectId.isValid(productoId)) {
      return res.status(400).json({
        success: false,
        message: 'El identificador del producto no es válido',
      });
    }

    const cantidadNum = toPositiveInteger(cantidad);
    if (cantidadNum === null) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser un entero mayor a 0',
      });
    }

    const producto = await Producto.findOne({ _id: productoId, activo: true });
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    if (tipo === 'salida' && producto.existencia < cantidadNum) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Existencia actual: ${producto.existencia}`,
      });
    }

    const delta = tipo === 'entrada' ? cantidadNum : -cantidadNum;
    producto.existencia += delta;
    await producto.save();

    const movimiento = await Movimiento.create({
      producto: producto._id,
      tipo,
      cantidad: cantidadNum,
    });

    return res.status(201).json({
      success: true,
      data: {
        movimiento,
        producto,
      },
    });
  } catch (error) {
    return next(error);
  }
}

// POST /entries — registra una entrada e incrementa el stock
async function createEntry(req, res, next) {
  return registerMovement('entrada', req, res, next);
}

// POST /outputs — registra una salida y decrementa el stock
async function createOutput(req, res, next) {
  return registerMovement('salida', req, res, next);
}

module.exports = { createEntry, createOutput };
