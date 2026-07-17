import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/axios';
import AnimatedBackground from '../components/AnimatedBackground';
import Logo from '../components/Logo';
import {
  ALLOWED_EMAIL_DOMAINS,
  getApiErrorMessage,
  validateRegister,
} from '../utils/validation';

const initialValues = {
  nombre: '',
  correo: '',
  password: '',
};

const inputClass =
  'w-full rounded-2xl border border-[#E4DEFF] bg-[#F8F6FF] px-4 py-3 text-sm text-[#36084D] placeholder:text-[#5411AE]/40 outline-none transition focus:border-[#5411AE] focus:bg-white focus:ring-4 focus:ring-[#A785EF]/20';

const labelClass = 'mb-1.5 block text-sm font-semibold text-[#36084D]';

export default function Register() {
  const navigate = useNavigate();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateRegister(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setSubmitError('');

    try {
      const { data } = await authApi.post('/auth/register', {
        nombre: values.nombre.trim(),
        correo: values.correo.trim(),
        password: values.password,
      });

      setDone({
        message: data.message,
        verificationUrl: data.data?.verificationUrl || '',
        correo: values.correo.trim(),
      });
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <AnimatedBackground />

      <motion.div
        className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-[1.75rem] border border-[#E8E2FF] bg-white shadow-[0_30px_90px_rgba(54,8,77,0.28)]"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#3B5897] via-[#5411AE] to-[#8280F7]" />

        <div className="px-7 pb-2 pt-7 sm:px-9 sm:pt-8">
          <div className="mb-7 flex flex-col items-center">
            <Logo size="lg" className="drop-shadow-sm" />
            <h1 className="mt-5 text-center font-display text-2xl font-bold text-[#36084D]">
              Crear cuenta
            </h1>
            <p className="mt-1.5 text-center text-sm text-[#5411AE]/75">
              Regístrate y verifica tu correo para empezar.
            </p>
          </div>

          {done ? (
            <div className="space-y-4 pb-8">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {done.message}
              </div>
              <p className="text-sm text-[#5411AE]/80">
                Te enviamos un enlace a <strong>{done.correo}</strong>. Sin SMTP, mira la consola
                de service-auth o el enlace de abajo.
              </p>
              {done.verificationUrl && (
                <a
                  href={done.verificationUrl}
                  className="block break-all rounded-2xl border border-[#E4DEFF] bg-[#F8F6FF] px-3 py-2 text-xs text-[#3B5897] underline"
                >
                  {done.verificationUrl}
                </a>
              )}
              <button
                type="button"
                onClick={() => navigate('/verificar-cuenta', { replace: true })}
                className="w-full rounded-2xl bg-gradient-to-r from-[#3B5897] to-[#5411AE] px-4 py-3.5 text-sm font-semibold text-white"
              >
                Ir a verificar cuenta
              </button>
              <p className="text-center text-sm text-[#5411AE]/75">
                <Link to="/login" className="font-semibold hover:underline">
                  Ir al login
                </Link>
              </p>
            </div>
          ) : (
            <>
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="nombre" className={labelClass}>
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    autoComplete="name"
                    value={values.nombre}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Tu nombre"
                  />
                  {errors.nombre && <p className="mt-1.5 text-sm text-red-600">{errors.nombre}</p>}
                </div>

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
                    placeholder="usuario@gmail.com"
                  />
                  <p className="mt-1 text-[11px] text-[#5411AE]/60">
                    Dominios: {ALLOWED_EMAIL_DOMAINS.join(', ')}
                  </p>
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
                    autoComplete="new-password"
                    value={values.password}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
                  )}
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
                  {loading ? 'Creando cuenta...' : 'Registrarse'}
                </motion.button>
              </form>

              <p className="mt-6 pb-8 text-center text-sm text-[#5411AE]/75">
                ¿Ya tienes cuenta?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#5411AE] underline-offset-2 hover:text-[#3B5897] hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
