export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400">
          {label}
        </label>
      )}
      <select
        className="bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-3 text-base md:text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors disabled:opacity-50 min-h-[48px] touch-manipulation appearance-none"
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
    </div>
  );
}