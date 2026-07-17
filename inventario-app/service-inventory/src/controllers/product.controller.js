const mongoose = require('mongoose');

const Producto = require('../models/product.model');
const { createError } = require('../middlewares/errorHandler');

// --- Validaciones de entrada (POST / PUT) ---

function esTextoObligatorio(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

function esNumeroNoNegativo(valor) {
  return typeof valor === 'number' && Number.isFinite(valor) && valor >= 0;
}

// Valida el body de creación. Devuelve { error } o { datos } listos para guardar.
function validarProductoCreate(body) {
  const { nombre, categoria, precio, existencia } = body;

  if (!esTextoObligatorio(nombre)) {
    return { error: createError(400, 'El nombre del producto es obligatorio') };
  }

  if (!esTextoObligatorio(categoria)) {
    return { error: createError(400, 'La categoría del producto es obligatoria') };
  }

  if (precio === undefined || precio === null || !esNumeroNoNegativo(precio)) {
    return {
      error: createError(400, 'El precio debe ser un número mayor o igual a 0'),
    };
  }

  if (existencia !== undefined && existencia !== null && !esNumeroNoNegativo(existencia)) {
    return {
      error: createError(400, 'La existencia debe ser un número mayor o igual a 0'),
    };
  }

  return {
    datos: {
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      precio,
      existencia: existencia === undefined || existencia === null ? 0 : existencia,
    },
  };
}

// Valida el body de actualización (parcial). Nombre/categoría, si se envían,
// son obligatorios (no vacíos); precio/existencia no pueden ser negativos.
function validarProductoUpdate(body) {
  const { nombre, categoria, precio, existencia } = body;
  const actualizacion = {};

  if (nombre !== undefined) {
    if (!esTextoObligatorio(nombre)) {
      return { error: createError(400, 'El nombre del producto es obligatorio') };
    }
    actualizacion.nombre = nombre.trim();
  }

  if (categoria !== undefined) {
    if (!esTextoObligatorio(categoria)) {
      return { error: createError(400, 'La categoría del producto es obligatoria') };
    }
    actualizacion.categoria = categoria.trim();
  }

  if (precio !== undefined) {
    if (precio === null || !esNumeroNoNegativo(precio)) {
      return {
        error: createError(400, 'El precio debe ser un número mayor o igual a 0'),
      };
    }
    actualizacion.precio = precio;
  }

  if (existencia !== undefined) {
    if (existencia === null || !esNumeroNoNegativo(existencia)) {
      return {
        error: createError(400, 'La existencia debe ser un número mayor o igual a 0'),
      };
    }
    actualizacion.existencia = existencia;
  }

  if (Object.keys(actualizacion).length === 0) {
    return { error: createError(400, 'No se enviaron campos para actualizar') };
  }

  return { datos: actualizacion };
}

function asegurarObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createError(400, 'El id del producto no es válido');
  }
  return null;
}

// GET /products?nombre=&categoria=
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
async function getProductById(req, res, next) {
  try {
    const idError = asegurarObjectId(req.params.id);
    if (idError) return next(idError);

    const producto = await Producto.findOne({ _id: req.params.id, activo: true });

    if (!producto) {
      return next(createError(404, 'Producto no encontrado'));
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
async function createProduct(req, res, next) {
  try {
    const validacion = validarProductoCreate(req.body);
    if (validacion.error) return next(validacion.error);

    const nuevoProducto = await Producto.create(validacion.datos);

    return res.status(201).json({
      success: true,
      data: nuevoProducto,
    });
  } catch (error) {
    return next(error);
  }
}

// PUT /products/:id
async function updateProduct(req, res, next) {
  try {
    const idError = asegurarObjectId(req.params.id);
    if (idError) return next(idError);

    const validacion = validarProductoUpdate(req.body);
    if (validacion.error) return next(validacion.error);

    const producto = await Producto.findOneAndUpdate(
      { _id: req.params.id, activo: true },
      validacion.datos,
      { new: true, runValidators: true }
    );

    if (!producto) {
      return next(createError(404, 'Producto no encontrado'));
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
async function deleteProduct(req, res, next) {
  try {
    const idError = asegurarObjectId(req.params.id);
    if (idError) return next(idError);

    const producto = await Producto.findOneAndUpdate(
      { _id: req.params.id, activo: true },
      { activo: false },
      { new: true }
    );

    if (!producto) {
      return next(createError(404, 'Producto no encontrado'));
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
