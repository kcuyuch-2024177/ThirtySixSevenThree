const mongoose = require('mongoose');

// Esquema del movimiento de inventario (entrada o salida de stock) que se
// guarda en la colección "movements".
const movementSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: [true, 'El movimiento debe estar asociado a un producto'],
  },
  tipo: {
    type: String,
    enum: {
      values: ['entrada', 'salida'],
      message: 'El tipo de movimiento debe ser "entrada" o "salida"',
    },
    required: [true, 'El tipo de movimiento es obligatorio'],
  },
  cantidad: {
    type: Number,
    required: [true, 'La cantidad del movimiento es obligatoria'],
    min: [1, 'La cantidad debe ser mayor a 0'],
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Movimiento', movementSchema, 'movements');
