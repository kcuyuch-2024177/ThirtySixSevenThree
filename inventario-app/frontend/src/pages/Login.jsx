import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/axios';
import BrandLogo from '../components/BrandLogo';
import { useAuthStore } from '../store/authStore';
import { getApiErrorMessage, isValidEmail } from '../utils/validation';

const initialValues = {
  correo: '',
  password: '',
};

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

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

    if (!values.correo.trim()) {
      nextErrors.correo = 'El correo es obligatorio';
    } else if (!isValidEmail(values.correo)) {
      nextErrors.correo = 'El correo no tiene un formato válido';
    }

    if (!values.password) {
      nextErrors.password = 'La contraseña es obligatoria';
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
      const { data } = await authApi.post('/auth/login', {
        correo: values.correo.trim(),
        password: values.password,
      });

      setAuth(data.token);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'No se pudo iniciar sesión'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-brand-200/70 bg-white/90 p-8 shadow-[0_18px_50px_rgba(54,8,77,0.12)] backdrop-blur">
        <BrandLogo size="md" className="mb-6" />

        <h1 className="text-center text-2xl font-semibold text-brand-deep">Iniciar sesión</h1>
        <p className="mt-2 text-center text-sm text-brand-blue/80">
          Accede a tu sistema de gestión de inventario.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="correo" className="mb-1.5 block text-sm font-medium text-brand-deep">
              Correo
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              value={values.correo}
              onChange={handleChange}
              className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-deep outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25"
              placeholder="usuario@empresa.com"
            />
            {errors.correo && (
              <p className="mt-1.5 text-sm text-red-600">{errors.correo}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-brand-deep">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-deep outline-none transition focus:border-brand-violet focus:ring-2 focus:ring-brand-violet/25"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-purple/25 transition hover:from-brand-purple hover:to-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-blue/80">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-semibold text-brand-purple hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
