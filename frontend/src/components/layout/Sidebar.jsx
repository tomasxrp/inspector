import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

const navItems = [
  { to: '/propiedades', label: 'Propiedades', icon: '🏠' },
  { to: '/clientes', label: 'Clientes', icon: '👤' },
  { to: '/revisiones', label: 'Revisiones', icon: '📋' },
];

export default function Sidebar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 flex items-center justify-center">
            <span className="text-zinc-900 font-mono font-black text-sm">IA</span>
          </div>
          <div>
            <p className="text-white font-mono font-bold text-sm tracking-wider uppercase">Inspect</p>
            <p className="text-zinc-500 font-mono text-xs tracking-widest">APP v1.0</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-zinc-600 text-xs font-mono uppercase tracking-widest px-3 mb-3">Módulos</p>
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm font-mono transition-all duration-150 border-l-2 ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border-transparent'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            <span className="uppercase tracking-wide text-xs font-semibold">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
            <span className="text-zinc-300 text-xs font-mono font-bold">
              {auth?.usuario?.nombre?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-200 text-xs font-mono font-semibold truncate">
              {auth?.usuario?.nombre} {auth?.usuario?.apellido}
            </p>
            <p className="text-zinc-500 text-xs font-mono truncate">{auth?.usuario?.correo}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors py-1 text-left"
        >
          ← Cerrar sesión
        </button>
      </div>
    </aside>
  );
}