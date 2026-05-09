import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

export default function MobileHeader() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="md:hidden sticky top-0 z-30 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-amber-500 flex items-center justify-center">
          <span className="text-zinc-900 font-mono font-black text-xs">IA</span>
        </div>
        <span className="text-white font-mono font-black text-sm tracking-widest uppercase">Inspect</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center">
          <span className="text-zinc-300 text-xs font-mono font-bold">
            {auth?.usuario?.nombre?.[0]?.toUpperCase() ?? 'U'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-zinc-500 hover:text-red-400 transition-colors text-xs font-mono uppercase tracking-widest"
        >
          Salir
        </button>
      </div>
    </header>
  );
}