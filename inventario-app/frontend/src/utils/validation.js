const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(correo) {
  return CORREO_REGEX.test(correo.trim());
}

export function getApiErrorMessage(error, fallback = 'Ocurrió un error. Intenta de nuevo.') {
  return error?.response?.data?.message || fallback;
}
