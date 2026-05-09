export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-zinc-700 text-zinc-300',
    amber: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    red: 'bg-red-500/20 text-red-400 border border-red-500/40',
    green: 'bg-green-500/20 text-green-400 border border-green-500/40',
    blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase tracking-wider ${variants[variant]}`}>
      {children}
    </span>
  );
}