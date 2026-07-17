const jwt = require('jsonwebtoken');

// Middleware para proteger rutas que requieren autenticación.
// Es autocontenido a propósito (solo depende de "jsonwebtoken" y variables
// de entorno) para poder copiarlo tal cual a otros servicios del monorepo
// (service-inventory, service-reports) sin arrastrar dependencias internas.
//
// Espera el header:
//   Authorization: Bearer <token>
//
// Si el token es válido, agrega el payload decodificado en req.user y
// continúa con next(). Si falta el token o no es válido, responde 401.
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No se proporcionó un token de autenticación',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No se proporcionó un token de autenticación',
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
}

module.exports = verifyToken;
