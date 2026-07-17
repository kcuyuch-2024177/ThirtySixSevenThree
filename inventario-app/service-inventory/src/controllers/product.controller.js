const mongoose = require('mongoose');

const Producto = require('../models/product.model');

// GET /products?nombre=&categoria=
// Lista productos activos. Opcionalmente filtra por nombre (búsqueda
// parcial, case-insensitive) y/o por categoría.
async function getProducts(req, res, next) {
  try {
    const { nombre, categoria } = req.query;
    const filtro = { activo: true };

    if (nombre && typeof nombre === 'string' && nombre.trim().length > 0) {
      filtro.nombre = { $regex: nombre.trim(), $options: 'i' };
    }

    if (categoria && typeof categoria === 'string' && categoria.trim().length > 0) {
      filtro.categoria = { $regex: categoria.trim(), $options: 'i' };
    }

    const productos = await Producto.find(filtro).sort({ fechaCreacion: -1 });

    return res.status(200).json({
      success: true,
      data: productos,
    });
  } catch (error) {
    return next(error);
  }
}

// GET /products/:id
// Obtiene un producto activo por su id.
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'El id del producto no es válido',
      });
    }

    const producto = await Producto.findOne({ _id: id, activo: true });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: producto,
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

// PUT /products/:id
// Edita los campos enviados de un producto activo.
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, categoria, precio, existencia } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'El id del producto no es válido',
      });
    }

    const actualizacion = {};

    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del producto es obligatorio',
        });
      }
      actualizacion.nombre = nombre.trim();
    }

    if (categoria !== undefined) {
      if (typeof categoria !== 'string' || categoria.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La categoría del producto es obligatoria',
        });
      }
      actualizacion.categoria = categoria.trim();
    }

    if (precio !== undefined) {
      if (typeof precio !== 'number' || precio < 0) {
        return res.status(400).json({
          success: false,
          message: 'El precio debe ser un número mayor o igual a 0',
        });
      }
      actualizacion.precio = precio;
    }

    if (existencia !== undefined) {
      if (typeof existencia !== 'number' || existencia < 0) {
        return res.status(400).json({
          success: false,
          message: 'La existencia debe ser un número mayor o igual a 0',
        });
      }
      actualizacion.existencia = existencia;
    }

    if (Object.keys(actualizacion).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se enviaron campos para actualizar',
      });
    }

    const producto = await Producto.findOneAndUpdate(
      { _id: id, activo: true },
      actualizacion,
      { new: true, runValidators: true }
    );

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: producto,
    });
  } catch (error) {
    return next(error);
  }
}

// DELETE /products/:id
// Soft delete: marca el producto como activo:false.
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'El id del producto no es válido',
      });
    }

    const producto = await Producto.findOneAndUpdate(
      { _id: id, activo: true },
      { activo: false },
      { new: true }
    );

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: producto,
      message: 'Producto eliminado correctamente',
    });
  } catch (error) {
    return next(error);
  }
}

// GET /categories
// Devuelve las categorías distintas usadas en productos activos.
async function getCategories(req, res, next) {
  try {
    const categorias = await Producto.distinct('categoria', { activo: true });

    return res.status(200).json({
      success: true,
      data: categorias.sort(),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
