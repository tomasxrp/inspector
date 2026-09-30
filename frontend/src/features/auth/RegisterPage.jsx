import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { registrarService } from './authService';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    rut: '',
    direccion: '',
    contrasena: '',
    confirmarContrasena: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones en el cliente
    if (!form.nombre.trim() || !form.apellido.trim() || !form.correo.trim() || !form.telefono.trim()) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (form.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (form.contrasena !== form.confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        correo: form.correo.trim().toLowerCase(),
        telefono: form.telefono.trim(),
        rut: form.rut.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
        contrasena: form.contrasena,
      };

      const res = await registrarService(payload);

      // Si el backend devuelve token y usuario, iniciamos sesión automáticamente
      if (res.data?.token && res.data?.usuario) {
        login({ token: res.data.token, usuario: res.data.usuario });
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error ?? 'Error al registrar usuario. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative py-12">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-lg">
        {/* Logo block */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3 mb-2">
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
        <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 shadow-2xl">
          <div className="mb-6 pb-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-amber-400">
                Registro de Inspector
              </h2>
              <p className="text-zinc-400 font-mono text-xs mt-1">
                Crea tu cuenta para gestionar tus propias inspecciones
              </p>
            </div>
            <span className="text-zinc-600 font-mono text-xs">PASO 1/1</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Juan"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="apellido"
                  required
                  value={form.apellido}
                  onChange={handleChange}
                  placeholder="Pérez"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder-zinc-600"
                />
              </div>
            </div>

            {/* Correo y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="correo"
                  required
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="inspector@empresa.cl"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="telefono"
                  required
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="+56 9 1234 5678"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder-zinc-600"
                />
              </div>
            </div>

            {/* RUT y Dirección (Opcionales) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">
                  RUT <span className="text-zinc-600 text-[10px]">(Opcional)</span>
                </label>
                <input
                  type="text"
                  name="rut"
                  value={form.rut}
                  onChange={handleChange}
                  placeholder="12.345.678-9"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">
                  Dirección <span className="text-zinc-600 text-[10px]">(Opcional)</span>
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Av. Providencia 1234"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder-zinc-600"
                />
              </div>
            </div>

            {/* Contraseña y Confirmación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400">
                    Contraseña *
                  </label>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="contrasena"
                  required
                  value={form.contrasena}
                  onChange={handleChange}
                  placeholder="Mín. 6 caracteres"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder-zinc-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase tracking-widest text-zinc-400">
                    Confirmar *
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
                  name="confirmarContrasena"
                  required
                  value={form.confirmarContrasena}
                  onChange={handleChange}
                  placeholder="Repite la contraseña"
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder-zinc-600"
                />
              </div>
            </div>

            {/* Errores */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 px-3 py-3 mt-2">
                <p className="text-red-400 text-xs font-mono">{error}</p>
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 text-zinc-900 font-mono font-black text-sm uppercase tracking-widest py-3.5 hover:bg-amber-400 active:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-3 touch-manipulation"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta e ingresar →'}
            </button>
          </form>

          {/* Enlace a Login */}
          <div className="mt-6 pt-5 border-t border-zinc-800 text-center">
            <p className="text-xs font-mono text-zinc-400">
              ¿Ya tienes una cuenta registrada?{' '}
              <Link
                to="/login"
                className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs font-mono mt-6 uppercase tracking-widest">
          Inspect App © 2026 · Seguridad y Privacidad Garantizadas
        </p>
      </div>
    </div>
  );
}
