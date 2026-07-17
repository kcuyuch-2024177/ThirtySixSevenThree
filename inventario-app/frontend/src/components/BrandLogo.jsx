import Logo from './Logo';

export default function BrandLogo({ size = 'md', showWordmark = false, className = '', blend = 'auto' }) {
  const map = { sm: 'sm', md: 'lg', lg: 'xl' };
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <Logo size={map[size] || 'md'} blend={blend} />
      {showWordmark && (
        <p className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
          <span className="text-[#8280F7]">Y</span>
          <span className="text-[#E8E0FF]">nventory</span>
        </p>
      )}
    </div>
  );
}

export { LOGO_SRC } from './Logo';
