export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between px-8 py-6 border-b border-zinc-800">
      <div>
        <h1 className="text-xl font-mono font-black uppercase tracking-widest text-white">{title}</h1>
        {subtitle && <p className="text-zinc-500 text-xs font-mono mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}