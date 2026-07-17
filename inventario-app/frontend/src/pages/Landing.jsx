import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingAtmosphere from '../components/LandingAtmosphere';
import Logo from '../components/Logo';
import Login from './Login';

const ease = [0.22, 1, 0.36, 1];

export default function Landing() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('intro');

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase('hero'), 2400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      <LandingAtmosphere />

      {/* Watermark tipográfico */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center overflow-hidden"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'intro' ? 0 : 1 }}
        transition={{ duration: 1.4, delay: 0.15 }}
      >
        <motion.p
          className="select-none font-display text-[18vw] font-extrabold leading-none tracking-[-0.05em] text-[rgba(241,240,255,0.05)] sm:text-[20vw]"
          animate={{ x: [0, -18, 10, 0], y: [0, 8, -6, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        >
          YNVENTORY
        </motion.p>
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="relative z-10 flex min-h-screen flex-col"
            exit={{ opacity: 0, filter: 'blur(16px)', scale: 1.02 }}
            transition={{ duration: 0.75, ease }}
          >
            <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
              <motion.div
                initial={{ opacity: 0, scale: 1.12, filter: 'blur(22px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.55, ease }}
                className="relative"
              >
                <div className="absolute inset-0 scale-125 rounded-full bg-[#8280F7]/20 blur-3xl" />
                <Logo size="hero" blend="lighten" className="relative drop-shadow-[0_24px_60px_rgba(130,128,247,0.35)]" />
              </motion.div>

              <motion.div
                className="h-px w-16 bg-gradient-to-r from-transparent via-[#A785EF] to-transparent"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              />
            </div>

            <motion.div
              className="absolute bottom-8 right-6 text-right sm:bottom-12 sm:right-12"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <p className="font-display text-sm font-semibold tracking-[0.12em] text-[#E6E1FF]">
                INVENTARIO CON CLARIDAD
              </p>
              <p className="mt-2 text-xs text-[#A785EF]/75">Preparando la experiencia…</p>
            </motion.div>
          </motion.div>
        )}

        {phase === 'hero' && (
          <motion.div
            key="hero"
            className="relative z-10 flex min-h-screen flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.7, ease }}
          >
            <header className="flex items-center justify-between gap-4 px-5 pt-6 sm:px-10 sm:pt-8">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, ease }}
              >
                <Logo size="md" blend="lighten" />
              </motion.div>

              <motion.div
                className="flex items-center gap-2 sm:gap-3"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, ease }}
              >
                <button
                  type="button"
                  onClick={() => setPhase('login')}
                  className="rounded-full border border-[rgba(167,133,239,0.35)] bg-[rgba(241,240,255,0.06)] px-4 py-2 text-sm font-medium text-[#E6E1FF] backdrop-blur-xl transition hover:border-[#A785EF]/60 hover:bg-[rgba(241,240,255,0.12)] sm:px-5"
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="rounded-full bg-gradient-to-r from-[#3B5897] to-[#5411AE] px-4 py-2 text-sm font-semibold text-[#F1F0FF] shadow-[0_10px_30px_rgba(84,17,174,0.4)] transition hover:brightness-110 sm:px-5"
                >
                  Registrarse
                </button>
              </motion.div>
            </header>

            <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-12 sm:px-10 lg:py-16">
              <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <motion.div
                    className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(130,128,247,0.35)] bg-[rgba(84,17,174,0.25)] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#A785EF] backdrop-blur-md"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Sistema de inventario
                  </motion.div>

                  <motion.h1
                    className="font-display text-5xl font-extrabold leading-[0.92] tracking-tight text-[#F1F0FF] sm:text-6xl md:text-7xl"
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.36, duration: 0.75, ease }}
                  >
                    Controla
                    <br />
                    tu stock
                    <br />
                    <span className="bg-gradient-to-r from-[#A785EF] via-[#8280F7] to-[#A785EF] bg-clip-text text-transparent">
                      con estilo
                    </span>
                  </motion.h1>

                  <motion.p
                    className="mt-6 max-w-md text-base font-light leading-relaxed text-[#E6E1FF]/85 sm:text-lg"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    Productos, movimientos, alertas y reportes en una experiencia limpia, rápida y
                    coherente de punta a punta.
                  </motion.p>

                  <motion.div
                    className="mt-9 flex flex-wrap items-center gap-3"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.62 }}
                  >
                    <motion.button
                      type="button"
                      onClick={() => setPhase('login')}
                      className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#3B5897] to-[#5411AE] px-8 py-3.5 font-display text-sm font-semibold tracking-wide text-[#F1F0FF] shadow-[0_18px_50px_rgba(84,17,174,0.5)]"
                      whileHover={{ scale: 1.03, filter: 'brightness(1.08)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Iniciar
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="rounded-full border border-[rgba(167,133,239,0.4)] px-6 py-3.5 text-sm font-medium text-[#E6E1FF] backdrop-blur-md transition hover:bg-[rgba(241,240,255,0.08)]"
                    >
                      Crear cuenta
                    </button>
                  </motion.div>
                </div>

                <motion.div
                  className="relative mx-auto hidden w-full max-w-md lg:block"
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.8, ease }}
                >
                  <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-[#8280F7]/25 via-[#5411AE]/15 to-transparent blur-2xl" />
                  <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(167,133,239,0.28)] bg-[rgba(54,8,77,0.35)] p-10 shadow-[0_30px_80px_rgba(54,8,77,0.45)] backdrop-blur-xl">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#A785EF]/20 blur-3xl" />
                    <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-[#3B5897]/30 blur-3xl" />
                    <Logo size="xl" blend="lighten" className="relative mx-auto" />
                    <p className="relative mt-8 text-center text-sm leading-relaxed text-[#A785EF]/90">
                      Una interfaz pensada para trabajar rápido sin perder el control.
                    </p>
                  </div>
                </motion.div>
              </div>
            </main>

            <footer className="flex items-center justify-between gap-4 px-5 pb-6 text-[11px] text-[#A785EF]/55 sm:px-10">
              <span>Ynventory · inventario moderno</span>
              <span className="tracking-[0.18em] uppercase">v1</span>
            </footer>
          </motion.div>
        )}

        {phase === 'login' && (
          <motion.div
            key="login"
            className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10"
            initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease }}
          >
            <div className="w-full max-w-[420px]">
              <Login embedded onBack={() => setPhase('hero')} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
