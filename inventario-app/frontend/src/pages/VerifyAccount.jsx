import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/axios';
import AnimatedBackground from '../components/AnimatedBackground';
import Logo from '../components/Logo';
import { getApiErrorMessage, isValidEmail } from '../utils/validation';

export default function VerifyAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [correo, setCorreo] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [devLink, setDevLink] = useState('');

  async function verify(tokenValue) {
    if (!tokenValue.trim()) {
      setStatus('error');
      setMessage('Pega o ingresa el token de verificación.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const { data } = await authApi.post('/auth/verify-email', {
        token: tokenValue.trim(),
      });
      setStatus('success');
      setMessage(data.message || 'Cuenta verificada correctamente.');
      window.setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (error) {
      setStatus('error');
      setMessage(getApiErrorMessage(error, 'No se pudo verificar la cuenta'));
    }
  }

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      verify(urlToken);
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await verify(token);
  }

  async function handleResend(event) {
    event.preventDefault();
    setResendMsg('');
    setDevLink('');

    if (!correo.trim() || !isValidEmail(correo)) {
      setResendMsg('Indica un correo válido para reenviar el enlace.');
      return;
    }

    setResendLoading(true);
    try {
      const { data } = await authApi.post('/auth/resend-verification', {
        correo: correo.trim(),
      });
      setResendMsg(data.message || 'Si aplica, enviamos un nuevo enlace.');
      if (data.data?.verificationUrl) {
        setDevLink(data.data.verificationUrl);
      }
    } catch (error) {
      setResendMsg(getApiErrorMessage(error, 'No se pudo reenviar el enlace'));
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <AnimatedBackground />

      <motion.div
        className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-[1.75rem] border border-[#E8E2FF] bg-white shadow-[0_30px_90px_rgba(54,8,77,0.28)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#3B5897] via-[#5411AE] to-[#8280F7]" />

        <div className="px-7 py-8 sm:px-9">
          <div className="mb-6 flex flex-col items-center">
            <Logo size="lg" />
            <h1 className="mt-4 text-center font-display text-2xl font-bold text-[#36084D]">
              Verificar cuenta
            </h1>
            <p className="mt-1.5 text-center text-sm text-[#5411AE]/75">
              Confirma tu correo para activar el acceso a Ynventory.
            </p>
          </div>

          {status === 'success' ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {message}
              <p className="mt-2 text-xs">Redirigiendo al inicio de sesión…</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="token" className="mb-1.5 block text-sm font-semibold text-[#36084D]">
                  Token de verificación
                </label>
                <textarea
                  id="token"
                  rows={4}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full rounded-2xl border border-[#E4DEFF] bg-[#F8F6FF] px-4 py-3 text-sm text-[#36084D] outline-none focus:border-[#5411AE] focus:ring-4 focus:ring-[#A785EF]/20"
                  placeholder="Pega aquí el token del correo o del enlace"
                />
              </div>

              {status === 'error' && message && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-2xl bg-gradient-to-r from-[#3B5897] to-[#5411AE] px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {status === 'loading' ? 'Verificando...' : 'Verificar cuenta'}
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-[#E8E2FF] pt-6">
            <p className="mb-3 text-sm font-semibold text-[#36084D]">¿No te llegó el correo?</p>
            <form className="space-y-3" onSubmit={handleResend}>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full rounded-2xl border border-[#E4DEFF] bg-[#F8F6FF] px-4 py-3 text-sm text-[#36084D] outline-none focus:border-[#5411AE] focus:ring-4 focus:ring-[#A785EF]/20"
                placeholder="tu-correo@gmail.com"
              />
              <button
                type="submit"
                disabled={resendLoading}
                className="w-full rounded-2xl border border-[#5411AE]/30 px-4 py-2.5 text-sm font-semibold text-[#5411AE] disabled:opacity-60"
              >
                {resendLoading ? 'Enviando...' : 'Reenviar enlace'}
              </button>
            </form>
            {resendMsg && <p className="mt-2 text-xs text-[#5411AE]/80">{resendMsg}</p>}
            {devLink && (
              <p className="mt-2 break-all text-xs text-[#3B5897]">
                Enlace de prueba (sin SMTP):{' '}
                <a className="underline" href={devLink}>
                  {devLink}
                </a>
              </p>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-[#5411AE]/75">
            <Link to="/login" className="font-semibold text-[#5411AE] hover:underline">
              Volver al login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
