const Producto = require('../models/product.model');

// GET /products
// Lista todos los productos activos (no incluye los marcados como
// inactivos mediante soft delete).
async function getProducts(req, res, next) {
  try {
    const productos = await Producto.find({ activo: true }).sort({ fechaCreacion: -1 });

    return res.status(200).json({
      success: true,
      data: productos,
    });
  } catch (error) {
    return next(error);
  }
}

// POST /products
// Crea un nuevo producto. Se valida lo mínimo necesario antes de guardar
// (nombre, categoría y precio son obligatorios; existencia es opcional
// y por defecto inicia en 0).
async function createProduct(req, res, next) {
  try {
    const { nombre, categoria, precio, existencia } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del producto es obligatorio',
      });
    }

    if (!categoria || typeof categoria !== 'string' || categoria.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La categoría del producto es obligatoria',
      });
    }

    if (precio === undefined || precio === null || typeof precio !== 'number' || precio < 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser un número mayor o igual a 0',
      });
    }

    if (existencia !== undefined && (typeof existencia !== 'number' || existencia < 0)) {
      return res.status(400).json({
        success: false,
        message: 'La existencia debe ser un número mayor o igual a 0',
      });
    }

    const nuevoProducto = await Producto.create({
      nombre,
      categoria,
      precio,
      existencia: existencia === undefined ? 0 : existencia,
    });

    return res.status(201).json({
      success: true,
      data: nuevoProducto,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getProducts, createProduct };
