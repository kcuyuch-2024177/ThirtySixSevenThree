import { motion } from 'framer-motion';

const blobs = [
  {
    className: 'left-[-10%] top-[12%] h-72 w-72 bg-[#8280F7]',
    animate: { x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.08, 0.95, 1] },
    duration: 18,
  },
  {
    className: 'right-[-8%] top-[28%] h-80 w-80 bg-[#A785EF]',
    animate: { x: [0, -35, 25, 0], y: [0, 40, -15, 0], scale: [1, 0.92, 1.06, 1] },
    duration: 22,
  },
  {
    className: 'bottom-[-12%] left-[25%] h-96 w-96 bg-[#3B5897]',
    animate: { x: [0, 30, -40, 0], y: [0, -25, 15, 0], scale: [1, 1.05, 0.97, 1] },
    duration: 26,
  },
];

export default function AnimatedBackground({ className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 20%, rgba(84, 17, 174, 0.55), transparent 50%), radial-gradient(ellipse at 80% 10%, rgba(59, 88, 151, 0.45), transparent 45%), linear-gradient(160deg, #36084D 0%, #5411AE 48%, #3B5897 100%)',
        }}
      />

      {blobs.map((blob, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full opacity-35 blur-3xl ${blob.className}`}
          animate={blob.animate}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(167, 133, 239, 0.5) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  );
}
