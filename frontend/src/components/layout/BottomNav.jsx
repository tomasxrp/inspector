import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/propiedades', label: 'Propiedades', icon: '🏠' },
  { to: '/clientes', label: 'Clientes', icon: '👤' },
  { to: '/revisiones', label: 'Revisiones', icon: '📋' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-zinc-800 flex md:hidden">
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-mono font-semibold uppercase tracking-wide transition-colors ${
              isActive
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-zinc-500 hover:text-zinc-200'
            }`
          }
        >
          <span className="text-xl leading-none">{icon}</span>
          <span className="text-[10px]">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}