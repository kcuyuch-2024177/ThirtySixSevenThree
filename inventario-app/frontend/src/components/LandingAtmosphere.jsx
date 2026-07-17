import { motion } from 'framer-motion';

export default function LandingAtmosphere({ className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 75% 35%, rgba(130,128,247,0.32), transparent 55%), radial-gradient(ellipse 80% 55% at 15% 85%, rgba(167,133,239,0.26), transparent 50%), radial-gradient(ellipse 55% 45% at 45% -5%, rgba(84,17,174,0.55), transparent 58%), linear-gradient(168deg, #1c0428 0%, #36084D 38%, #5411AE 100%)',
        }}
      />

      <motion.div
        className="absolute -left-[12%] top-[8%] h-[46vw] w-[46vw] rounded-full bg-[#8280F7]/35 blur-[110px]"
        animate={{ x: [0, 50, -25, 0], y: [0, -35, 28, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-[10%] bottom-[0%] h-[52vw] w-[52vw] rounded-full bg-[#A785EF]/28 blur-[120px]"
        animate={{ x: [0, -40, 24, 0], y: [0, 40, -18, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-[32%] top-[32%] h-[34vw] w-[34vw] rounded-full bg-[#3B5897]/40 blur-[100px]"
        animate={{ scale: [1, 1.15, 0.94, 1], opacity: [0.35, 0.55, 0.28, 0.35] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute inset-0 flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-full flex-1 border-r border-[rgba(167,133,239,0.1)] last:border-r-0"
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-[#36084D]/20 backdrop-blur-[1.5px]" />

      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-soft-light"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}
