export default function LoadingBlock({ message = 'Cargando...' }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-brand-200/60 bg-white/70 px-4 py-12 text-sm text-brand-blue/80">
      <span className="inline-flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-lavender border-t-brand-purple" />
        {message}
      </span>
    </div>
  );
}
