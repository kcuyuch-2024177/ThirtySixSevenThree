// Validación manual simple, sin librerías externas, para mantener el
// servicio lo más simple posible.

// Regex sencilla para validar formato de correo (suficiente para este caso).
const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NOMBRE_MIN_LENGTH = 2;
const PASSWORD_MIN_LENGTH = 6;

// Helper para responder siempre con el mismo formato de error de validación,
// incluyendo el campo específico que falló (útil para mostrarlo en un
// formulario del frontend).
function errorValidacion(res, campo, message) {
  return res.status(400).json({ success: false, campo, message });
}

// Valida los datos del body al registrar un usuario.
// Revisa nombre, correo y password, cada uno con su propio mensaje de error.
function validateRegister(req, res, next) {
  const { nombre, correo, password } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return errorValidacion(res, 'nombre', 'El nombre es obligatorio');
  }

  if (nombre.trim().length < NOMBRE_MIN_LENGTH) {
    return errorValidacion(
      res,
      'nombre',
      `El nombre debe tener al menos ${NOMBRE_MIN_LENGTH} caracteres`
    );
  }

  if (!correo || typeof correo !== 'string' || correo.trim().length === 0) {
    return errorValidacion(res, 'correo', 'El correo es obligatorio');
  }

  if (!CORREO_REGEX.test(correo.trim())) {
    return errorValidacion(res, 'correo', 'El correo no tiene un formato válido');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    return errorValidacion(res, 'password', 'La contraseña es obligatoria');
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return errorValidacion(
      res,
      'password',
      `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
    );
  }

  next();
}

// Valida los datos del body al iniciar sesión.
// Aquí solo se valida el FORMATO de los campos (que existan y tengan buena
// forma); si el correo o la contraseña son incorrectos eso lo determina
// auth.controller.js más adelante, no este middleware.
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
