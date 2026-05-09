import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { loginService } from './authService';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: '', contrasena: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginService(form.correo, form.contrasena);
      login({ token: res.data.token, usuario: res.data.usuario });
      navigate('/propiedades');
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo block */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-amber-500 flex items-center justify-center">
              <span className="text-zinc-900 font-mono font-black text-lg">IA</span>
            </div>
            <div className="text-left">
              <p className="text-white font-mono font-black text-2xl tracking-widest uppercase">
                Inspect
              </p>
              <p className="text-zinc-500 font-mono text-xs tracking-[0.3em] uppercase">
                Sistema de Inspección
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 p-6">
          <div className="mb-5 pb-4 border-b border-zinc-800">
            <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-amber-400">
              Acceso al sistema
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                placeholder="inspector@empresa.cl"
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-3 text-base font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder-zinc-600 min-h-[50px]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={form.contrasena}
                onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-3 text-base font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder-zinc-600 min-h-[50px]"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 px-3 py-3">
                <p className="text-red-400 text-sm font-mono">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 text-zinc-900 font-mono font-black text-sm uppercase tracking-widest py-4 hover:bg-amber-400 active:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 min-h-[54px] touch-manipulation"
            >
              {loading ? 'Verificando...' : 'Ingresar →'}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-xs font-mono mt-6 uppercase tracking-widest">
          Inspect App © 2026
        </p>
      </div>
    </div>
  );
}