// Middleware de manejo de errores centralizado.
// Debe registrarse SIEMPRE al final de app.js, después de las rutas.

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function errorHandler(err, req, res, next) {
  console.error(err);

  // Errores de axios al llamar a service-inventory
  if (err.isAxiosError) {
    const status = err.response?.status || 502;
    const message =
      err.response?.data?.message ||
      'Error al consultar el servicio de inventario';

    return res.status(status).json({
      success: false,
      message,
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
module.exports.createError = createError;
