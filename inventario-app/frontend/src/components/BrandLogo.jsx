export default function BrandLogo({ size = 'md', showWordmark = false, className = '' }) {
  // El PNG ya incluye el wordmark; showWordmark solo sirve si se necesita texto extra.
  const sizes = {
    sm: { image: 'h-12 w-auto', text: 'text-xl' },
    md: { image: 'h-36 w-auto', text: 'text-3xl' },
    lg: { image: 'h-44 w-auto', text: 'text-4xl' },
  };

  const current = sizes[size] || sizes.md;

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <img
        src="/logo-ynventory.png"
        alt="Ynventory"
        className={`${current.image} object-contain`}
      />
      {showWordmark && (
        <p className={`mt-2 font-semibold tracking-tight ${current.text}`}>
          <span className="text-brand-blue">Y</span>
          <span className="text-brand-deep">nventory</span>
        </p>
      )}
    </div>
  );
}
