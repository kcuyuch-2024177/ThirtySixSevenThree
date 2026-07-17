import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/axios';
import { getApiErrorMessage, isValidEmail } from '../utils/validation';

const initialValues = {
  nombre: '',
  correo: '',
  password: '',
};

export default function Register() {
  const navigate = useNavigate();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitError('');
  }

  function validate() {
    const nextErrors = {};

    if (!values.nombre.trim()) {
      nextErrors.nombre = 'El nombre es obligatorio';
    } else if (values.nombre.trim().length < 2) {
      nextErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!values.correo.trim()) {
      nextErrors.correo = 'El correo es obligatorio';
    } else if (!isValidEmail(values.correo)) {
      nextErrors.correo = 'El correo no tiene un formato válido';
    }

    if (!values.password) {
      nextErrors.password = 'La contraseña es obligatoria';
    } else if (values.password.length < 6) {
      nextErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError('');

    try {
      await authApi.post('/auth/register', {
        nombre: values.nombre.trim(),
        correo: values.correo.trim(),
        password: values.password,
      });

      navigate('/login', { replace: true });
    } catch (error) {
      const campo = error?.response?.data?.campo;
      const message = getApiErrorMessage(error, 'No se pudo crear la cuenta');

      if (campo) {
        setErrors((prev) => ({ ...prev, [campo]: message }));
      } else {
        setSubmitError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Crear cuenta</h1>
        <p className="mt-2 text-sm text-slate-500">
          Regístrate para empezar a gestionar el inventario.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              value={values.nombre}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="Tu nombre"
            />
            {errors.nombre && (
              <p className="mt-1.5 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label htmlFor="correo" className="mb-1.5 block text-sm font-medium text-slate-700">
              Correo
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              value={values.correo}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="usuario@empresa.com"
            />
            {errors.correo && (
              <p className="mt-1.5 text-sm text-red-600">{errors.correo}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-slate-900 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
