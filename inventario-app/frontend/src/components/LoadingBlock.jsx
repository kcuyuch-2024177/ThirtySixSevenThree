export default function LoadingBlock({ message = 'Cargando...' }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-[#8280F7]/20 bg-[#5411AE]/15 px-4 py-12 text-sm text-[#A785EF] backdrop-blur-md">
      <span className="inline-flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#A785EF] border-t-[#8280F7]" />
        {message}
      </span>
    </div>
  );
}
