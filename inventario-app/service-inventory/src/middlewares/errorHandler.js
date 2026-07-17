// Middleware de manejo de errores centralizado.
// Debe registrarse SIEMPRE al final de app.js, después de las rutas,
// para que Express lo use como manejador de errores (4 parámetros).
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
