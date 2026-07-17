// Middleware de manejo de errores centralizado.
// Debe registrarse SIEMPRE al final de app.js, después de las rutas,
// para que Express lo use como manejador de errores (4 parámetros).

// Helper para crear errores con status HTTP y dejar que el middleware
// responda siempre en formato { success: false, message }.
function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function errorHandler(err, req, res, next) {
  console.error(err);

  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // ObjectId inválido u otro cast fallido de Mongoose -> 400
  if (err.name === 'CastError') {
    status = 400;
    if (err.path === '_id' || err.kind === 'ObjectId') {
      message = 'El id del producto no es válido';
    } else {
      message = `Valor inválido para el campo "${err.path}"`;
    }
  }

  // Validaciones del schema de Mongoose (required, min, enum, etc.) -> 400
  if (err.name === 'ValidationError') {
    status = 400;
    const primerError = Object.values(err.errors || {})[0];
    message = primerError?.message || 'Error de validación';
  }

  // Documento no encontrado (p. ej. .orFail()) -> 404
  if (err.name === 'DocumentNotFoundError') {
    status = 404;
    message = err.message || 'Producto no encontrado';
  }

  // Índice único duplicado
  if (err.code === 11000) {
    status = 409;
    message = 'Ya existe un registro con esos datos';
  }

  res.status(status).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
module.exports.createError = createError;
