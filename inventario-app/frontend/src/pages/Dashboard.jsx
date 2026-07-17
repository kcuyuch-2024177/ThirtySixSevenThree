import { motion } from 'framer-motion';
import {
  ArrowDownUp,
  BellRing,
  ClipboardList,
  Package,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const cards = [
  {
    to: '/productos',
    title: 'Productos',
    description: 'Catálogo completo: crear, editar, buscar y eliminar productos.',
    icon: Package,
    accent: '#3B5897',
    glow: 'rgba(59, 88, 151, 0.45)',
    shape: 'from-[#3B5897]/40 to-transparent',
  },
  {
    to: '/movimientos',
    title: 'Movimientos',
    description: 'Registra entradas y salidas para mantener el stock al día.',
    icon: ArrowDownUp,
    accent: '#8280F7',
    glow: 'rgba(130, 128, 247, 0.45)',
    shape: 'from-[#8280F7]/35 to-transparent',
  },
  {
    to: '/alertas',
    title: 'Alertas',
    description: 'Revisa productos con stock bajo o agotados.',
    icon: BellRing,
    accent: '#A785EF',
    glow: 'rgba(167, 133, 239, 0.45)',
    shape: 'from-[#A785EF]/35 to-transparent',
  },
  {
    to: '/reportes',
    title: 'Reportes',
    description: 'Resumen del inventario, categorías y top productos.',
    icon: ClipboardList,
    accent: '#5411AE',
    glow: 'rgba(84, 17, 174, 0.5)',
    shape: 'from-[#5411AE]/45 to-transparent',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <motion.header
        className="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Logo
          size="md"
          blend="lighten"
          className="drop-shadow-[0_8px_24px_rgba(130,128,247,0.35)]"
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#E8E0FF] sm:text-4xl">
            Bienvenido a Ynventory
          </h1>
          <p className="mt-1.5 text-sm text-[#A785EF]/90 sm:text-base">
            Elige una sección para continuar. Todo tu inventario, en un solo lugar.
          </p>
        </div>
      </motion.header>

      <motion.div
        className="grid gap-5 sm:grid-cols-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.to}
              type="button"
              variants={item}
              onClick={() => navigate(card.to)}
              className="group relative overflow-hidden rounded-3xl border border-[#8280F7]/30 bg-[#5411AE]/10 p-6 text-left backdrop-blur-md sm:p-7"
              whileHover={{
                y: -6,
                scale: 1.02,
                boxShadow: `0 20px 50px ${card.glow}`,
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <div
                className={`pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-gradient-to-br ${card.shape} blur-2xl`}
              />
              <div
                className="pointer-events-none absolute -bottom-10 left-8 h-28 w-28 rounded-full opacity-40 blur-2xl"
                style={{ backgroundColor: card.accent }}
              />

              <div
                className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#8280F7]/25 shadow-lg"
                style={{
                  background: `linear-gradient(145deg, ${card.accent}cc, #36084Daa)`,
                  boxShadow: `0 10px 30px ${card.glow}`,
                }}
              >
                <Icon className="h-7 w-7 text-[#E8E0FF]" strokeWidth={1.75} />
              </div>

              <h2 className="relative text-2xl font-bold text-[#E8E0FF]">{card.title}</h2>
              <p className="relative mt-2 text-sm leading-relaxed text-[#A785EF]/90">
                {card.description}
              </p>

              <span
                className="relative mt-5 inline-flex text-xs font-semibold uppercase tracking-wider"
                style={{ color: card.accent === '#5411AE' ? '#A785EF' : card.accent }}
              >
                Abrir sección →
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
