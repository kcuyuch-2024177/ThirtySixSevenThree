/** Logo oficial Ynventory — siempre la versión con transparencia (sin fondo negro). */
export const LOGO_SRC = '/logo-ynventory-transparent.png?v=4';

const sizeClass = {
  xs: 'h-8',
  sm: 'h-11',
  md: 'h-14',
  lg: 'h-28',
  xl: 'h-36',
  hero: 'h-40 sm:h-48',
};

/**
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'hero'} size
 * @param {'auto'|'lighten'} blend - lighten oculta residuales negros sobre fondos oscuros
 */
export default function Logo({
  size = 'md',
  className = '',
  blend = 'auto',
  alt = 'Ynventory',
}) {
  const height = sizeClass[size] || sizeClass.md;
  const blendClass = blend === 'lighten' ? 'mix-blend-lighten' : '';

  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      draggable={false}
      className={`${height} w-auto max-w-full object-contain select-none ${blendClass} ${className}`}
    />
  );
}
