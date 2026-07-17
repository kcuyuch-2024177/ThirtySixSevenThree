function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || err.response?.status || 500;
  const message =
    err.response?.data?.message ||
    err.message ||
    'Error interno del servidor';

  res.status(status).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
