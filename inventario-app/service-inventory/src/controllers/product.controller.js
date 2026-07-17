const Producto = require('../models/product.model');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toNonNegativeNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num) || num < 0) return null;
  return num;
}

function ownerId(req) {
  return String(req.user.id);
}

async function getProducts(req, res, next) {
  try {
    const filtro = { activo: true, usuario: ownerId(req) };
    const { nombre, categoria } = req.query;

    if (nombre && typeof nombre === 'string' && nombre.trim()) {
      filtro.nombre = { $regex: escapeRegex(nombre.trim()), $options: 'i' };
    }

    if (categoria && typeof categoria === 'string' && categoria.trim()) {
      filtro.categoria = { $regex: escapeRegex(categoria.trim()), $options: 'i' };
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

    const precioNum = toNonNegativeNumber(precio);
    if (precioNum === null) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser un número mayor o igual a 0',
      });
    }

    let existenciaNum = 0;
    if (existencia !== undefined && existencia !== null && existencia !== '') {
      existenciaNum = toNonNegativeNumber(existencia);
      if (existenciaNum === null) {
        return res.status(400).json({
          success: false,
          message: 'La existencia debe ser un número mayor o igual a 0',
        });
      }
    }

    const nuevoProducto = await Producto.create({
      usuario: ownerId(req),
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      precio: precioNum,
      existencia: existenciaNum,
    });

    return res.status(201).json({
      success: true,
      data: nuevoProducto,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, categoria, precio, existencia } = req.body;

    const producto = await Producto.findOne({
      _id: id,
      activo: true,
      usuario: ownerId(req),
    });
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del producto es obligatorio',
        });
      }
      producto.nombre = nombre.trim();
    }

    if (categoria !== undefined) {
      if (typeof categoria !== 'string' || categoria.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La categoría del producto es obligatoria',
        });
      }
      producto.categoria = categoria.trim();
    }

    if (precio !== undefined) {
      const precioNum = toNonNegativeNumber(precio);
      if (precioNum === null) {
        return res.status(400).json({
          success: false,
          message: 'El precio debe ser un número mayor o igual a 0',
        });
      }
      producto.precio = precioNum;
    }

    if (existencia !== undefined) {
      const existenciaNum = toNonNegativeNumber(existencia);
      if (existenciaNum === null) {
        return res.status(400).json({
          success: false,
          message: 'La existencia debe ser un número mayor o igual a 0',
        });
      }
      producto.existencia = existenciaNum;
    }

    await producto.save();

    return res.status(200).json({
      success: true,
      data: producto,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const producto = await Producto.findOneAndUpdate(
      { _id: id, activo: true, usuario: ownerId(req) },
      { activo: false },
      { new: true },
    );

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Producto eliminado correctamente',
      data: producto,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
