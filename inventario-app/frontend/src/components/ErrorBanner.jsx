export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#FF8FA3]/35 bg-[#5c1a2a]/50 px-4 py-3 text-sm text-[#FF8FA3] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-lg border border-[#FF8FA3]/30 bg-[#36084D]/60 px-3 py-1.5 text-xs font-semibold text-[#FF8FA3] transition hover:bg-[#5411AE]/40"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
