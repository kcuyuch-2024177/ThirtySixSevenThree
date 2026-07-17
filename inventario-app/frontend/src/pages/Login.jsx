import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/axios';
import AnimatedBackground from '../components/AnimatedBackground';
import Logo from '../components/Logo';
import { useAuthStore } from '../store/authStore';
import { getApiErrorMessage, validateLogin } from '../utils/validation';

const initialValues = {
  correo: '',
  password: '',
};

const inputClass =
  'w-full rounded-2xl border border-[#E4DEFF] bg-[#F8F6FF] px-4 py-3 text-sm text-[#36084D] placeholder:text-[#5411AE]/40 outline-none transition focus:border-[#5411AE] focus:bg-white focus:ring-4 focus:ring-[#A785EF]/20';

const labelClass = 'mb-1.5 block text-sm font-semibold text-[#36084D]';

export default function Login({ embedded = false, onBack }) {
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

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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

  const formCard = (
    <motion.div
      className="relative w-full overflow-hidden rounded-[1.75rem] border border-[#E8E2FF] bg-white shadow-[0_30px_90px_rgba(54,8,77,0.28)]"
      {...(embedded
        ? {}
        : {
            initial: { opacity: 0, y: 28 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          })}
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-[#3B5897] via-[#5411AE] to-[#8280F7]" />

      <div className="px-7 pb-2 pt-7 sm:px-9 sm:pt-8">
        <div className="mb-7 flex flex-col items-center">
          <Logo size="lg" className="drop-shadow-sm" />
          <h1 className="mt-5 text-center font-display text-2xl font-bold text-[#36084D]">
            Iniciar sesión
          </h1>
          <p className="mt-1.5 text-center text-sm text-[#5411AE]/75">
            Accede a tu sistema de gestión de inventario.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="correo" className={labelClass}>
              Correo
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              value={values.correo}
              onChange={handleChange}
              className={inputClass}
              placeholder="usuario@empresa.com"
            />
            {errors.correo && <p className="mt-1.5 text-sm text-red-600">{errors.correo}</p>}
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              className={inputClass}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
          </div>

          {submitError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-2xl bg-gradient-to-r from-[#3B5897] to-[#5411AE] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_14px_36px_rgba(84,17,174,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
            whileHover={loading ? undefined : { scale: 1.015, filter: 'brightness(1.06)' }}
            whileTap={loading ? undefined : { scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </motion.button>
        </form>

        <p className="mt-6 pb-8 text-center text-sm text-[#5411AE]/75">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#5411AE] underline-offset-2 hover:text-[#3B5897] hover:underline"
          >
            Regístrate
          </Link>
        </p>

        {embedded && typeof onBack === 'function' && (
          <button
            type="button"
            onClick={onBack}
            className="mb-7 w-full text-center text-xs font-medium text-[#5411AE]/65 transition hover:text-[#3B5897]"
          >
            ← Volver al inicio
          </button>
        )}
      </div>
    </motion.div>
  );

  if (embedded) {
    return formCard;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-[420px]">{formCard}</div>
    </div>
  );
}
