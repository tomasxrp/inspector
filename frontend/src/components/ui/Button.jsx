export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 font-mono font-semibold tracking-wide uppercase transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-amber-500 text-zinc-900 hover:bg-amber-400 focus:ring-amber-500',
    secondary: 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600 focus:ring-zinc-500',
    danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
    ghost: 'bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white focus:ring-zinc-500 border border-zinc-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}