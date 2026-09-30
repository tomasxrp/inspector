import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { loginService } from './authService';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: '', contrasena: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const correoLimpio = form.correo.trim().toLowerCase();
    if (!correoLimpio || !form.contrasena) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }

    setLoading(true);
    try {
      const res = await loginService(correoLimpio, form.contrasena);
      login({ token: res.data.token, usuario: res.data.usuario });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative">
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
        <div className="bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] font-mono text-amber-500 hover:text-amber-400 uppercase tracking-wider"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
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

          {/* Enlace al registro */}
          <div className="mt-6 pt-5 border-t border-zinc-800 text-center">
            <p className="text-xs font-mono text-zinc-400">
              ¿No tienes una cuenta aún?{' '}
              <Link
                to="/registro"
                className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs font-mono mt-6 uppercase tracking-widest">
          Inspect App © 2026 · Seguridad y Privacidad
        </p>
      </div>
    </div>
  );
}