// Middleware de manejo de errores centralizado.
// Debe registrarse SIEMPRE al final de app.js, después de las rutas.
// Captura fallos al llamar a service-inventory (caído, timeout, 5xx, etc.)
// y responde 502 sin tumbar el proceso de Node.

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function mensajeErrorInventario(err) {
  // Sin respuesta HTTP: red, servicio caído o timeout
  if (!err.response) {
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      return 'El servicio de inventario no respondió a tiempo (timeout)';
    }
    if (err.code === 'ECONNREFUSED') {
      return 'No se pudo conectar con el servicio de inventario (servicio caído o no iniciado)';
    }
    if (err.code === 'ENOTFOUND') {
      return 'No se encontró el host del servicio de inventario';
    }
    return 'El servicio de inventario no está disponible';
  }

  // El Servicio A respondió con un error HTTP
  const upstreamMessage = err.response.data?.message;
  if (upstreamMessage) {
    return `Error del servicio de inventario: ${upstreamMessage}`;
  }

  return `El servicio de inventario respondió con error (HTTP ${err.response.status})`;
}

function errorHandler(err, req, res, next) {
  console.error(err);

  // Evitar intentar responder dos veces
  if (res.headersSent) {
    return next(err);
  }

  // Fallos al consultar service-inventory -> 502 Bad Gateway
  if (err.isAxiosError) {
    return res.status(502).json({
      success: false,
      message: mensajeErrorInventario(err),
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  return res.status(status).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
module.exports.createError = createError;
