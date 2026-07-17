const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(correo) {
  return CORREO_REGEX.test(correo.trim());
}

export function getApiErrorMessage(error, fallback = 'Ocurrió un error. Intenta de nuevo.') {
  return error?.response?.data?.message || fallback;
}

export function validateLogin(values) {
  const errors = {};

  if (!values.correo.trim()) {
    errors.correo = 'El correo es obligatorio';
  } else if (!isValidEmail(values.correo)) {
    errors.correo = 'El correo no tiene un formato válido';
  }

  if (!values.password) {
    errors.password = 'La contraseña es obligatoria';
  } else if (values.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  return errors;
}

export function validateRegister(values) {
  const errors = {};

  if (!values.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio';
  } else if (values.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  } else if (values.nombre.trim().length > 80) {
    errors.nombre = 'El nombre no puede superar 80 caracteres';
  }

  if (!values.correo.trim()) {
    errors.correo = 'El correo es obligatorio';
  } else if (!isValidEmail(values.correo)) {
    errors.correo = 'El correo no tiene un formato válido';
  }

  if (!values.password) {
    errors.password = 'La contraseña es obligatoria';
  } else if (values.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  } else if (values.password.length > 72) {
    errors.password = 'La contraseña no puede superar 72 caracteres';
  }

  return errors;
}

export function validateProduct(values) {
  const errors = {};

  if (!values.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio';
  } else if (values.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  } else if (values.nombre.trim().length > 120) {
    errors.nombre = 'El nombre no puede superar 120 caracteres';
  }

  if (!values.categoria.trim()) {
    errors.categoria = 'La categoría es obligatoria';
  } else if (values.categoria.trim().length < 2) {
    errors.categoria = 'La categoría debe tener al menos 2 caracteres';
  } else if (values.categoria.trim().length > 80) {
    errors.categoria = 'La categoría no puede superar 80 caracteres';
  }

  if (values.precio === '' || values.precio === null || values.precio === undefined) {
    errors.precio = 'El precio es obligatorio';
  } else {
    const precio = Number(values.precio);
    if (Number.isNaN(precio)) {
      errors.precio = 'El precio debe ser un número válido';
    } else if (precio < 0) {
      errors.precio = 'El precio no puede ser negativo';
    } else if (precio > 1_000_000_000) {
      errors.precio = 'El precio es demasiado alto';
    }
  }

  if (values.existencia === '' || values.existencia === null || values.existencia === undefined) {
    errors.existencia = 'La existencia es obligatoria';
  } else {
    const existencia = Number(values.existencia);
    if (Number.isNaN(existencia)) {
      errors.existencia = 'La existencia debe ser un número válido';
    } else if (!Number.isInteger(existencia)) {
      errors.existencia = 'La existencia debe ser un número entero';
    } else if (existencia < 0) {
      errors.existencia = 'La existencia no puede ser negativa';
    } else if (existencia > 1_000_000) {
      errors.existencia = 'La existencia es demasiado alta';
    }
  }

  return errors;
}

export function validateProductSearch(values) {
  const errors = {};

  if (values.nombre && values.nombre.trim().length > 120) {
    errors.nombre = 'La búsqueda por nombre es demasiado larga';
  }

  if (values.categoria && values.categoria.trim().length > 80) {
    errors.categoria = 'La búsqueda por categoría es demasiado larga';
  }

  return errors;
}

export function validateMovement(values) {
  const errors = {};

  if (!values.productoId) {
    errors.productoId = 'Selecciona un producto';
  }

  if (values.cantidad === '' || values.cantidad === null || values.cantidad === undefined) {
    errors.cantidad = 'La cantidad es obligatoria';
  } else {
    const cantidad = Number(values.cantidad);
    if (Number.isNaN(cantidad)) {
      errors.cantidad = 'La cantidad debe ser un número válido';
    } else if (!Number.isInteger(cantidad)) {
      errors.cantidad = 'La cantidad debe ser un número entero';
    } else if (cantidad < 1) {
      errors.cantidad = 'La cantidad debe ser mayor a 0';
    } else if (cantidad > 1_000_000) {
      errors.cantidad = 'La cantidad es demasiado alta';
    }
  }

  return errors;
}

export function formatCurrency(value) {
  return Number(value || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('es-MX');
}
