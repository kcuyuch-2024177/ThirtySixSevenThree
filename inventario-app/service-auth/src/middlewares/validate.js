const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOMBRE_MIN_LENGTH = 2;
const PASSWORD_MIN_LENGTH = 6;

const { isAllowedEmailDomain, getAllowedDomains } = require('../services/mailer');

function errorValidacion(res, campo, message) {
  return res.status(400).json({ success: false, campo, message });
}

function validateRegister(req, res, next) {
  const { nombre, correo, password } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return errorValidacion(res, 'nombre', 'El nombre es obligatorio');
  }

  if (nombre.trim().length < NOMBRE_MIN_LENGTH) {
    return errorValidacion(
      res,
      'nombre',
      `El nombre debe tener al menos ${NOMBRE_MIN_LENGTH} caracteres`,
    );
  }

  if (!correo || typeof correo !== 'string' || correo.trim().length === 0) {
    return errorValidacion(res, 'correo', 'El correo es obligatorio');
  }

  if (!CORREO_REGEX.test(correo.trim())) {
    return errorValidacion(res, 'correo', 'El correo no tiene un formato válido');
  }

  if (!isAllowedEmailDomain(correo.trim())) {
    return errorValidacion(
      res,
      'correo',
      `Solo se permiten correos de: ${getAllowedDomains().join(', ')}`,
    );
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    return errorValidacion(res, 'password', 'La contraseña es obligatoria');
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return errorValidacion(
      res,
      'password',
      `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
    );
  }

  next();
}

function validateLogin(req, res, next) {
  const { correo, password } = req.body;

  if (!correo || typeof correo !== 'string' || correo.trim().length === 0) {
    return errorValidacion(res, 'correo', 'El correo es obligatorio');
  }

  if (!CORREO_REGEX.test(correo.trim())) {
    return errorValidacion(res, 'correo', 'El correo no tiene un formato válido');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    return errorValidacion(res, 'password', 'La contraseña es obligatoria');
  }

  next();
}

module.exports = { validateRegister, validateLogin };
