export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="px-4 md:px-8 py-4 md:py-6 border-b border-zinc-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-base md:text-xl font-mono font-black uppercase tracking-widest text-white leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-zinc-500 text-xs font-mono mt-1 truncate">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}