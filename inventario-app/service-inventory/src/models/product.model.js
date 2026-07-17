const mongoose = require('mongoose');

// Esquema del producto que se guarda en la colección "products".
const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
  },
  categoria: {
    type: String,
    required: [true, 'La categoría del producto es obligatoria'],
    trim: true,
  },
  precio: {
    type: Number,
    required: [true, 'El precio del producto es obligatorio'],
    min: [0, 'El precio no puede ser negativo'],
  },
  existencia: {
    type: Number,
    required: true,
    min: [0, 'La existencia no puede ser negativa'],
    default: 0,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  // Soft delete: en vez de borrar el producto de la base de datos, se marca
  // como inactivo. Así no se pierde el historial de movimientos asociados.
  activo: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Producto', productSchema, 'products');
