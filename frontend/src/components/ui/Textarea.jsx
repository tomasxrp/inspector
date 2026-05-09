export default function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400">
          {label}
        </label>
      )}
      <textarea
        rows={4}
        className="bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder-zinc-600 resize-none disabled:opacity-50"
        {...props}
      />
      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
    </div>
  );
}