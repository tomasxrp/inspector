import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { crearCliente, actualizarCliente, getClientePorCorreo } from './clienteService';

export default function ClienteForm() {
  const { correo } = useParams();
  const isEditing = Boolean(correo);
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', telefono: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEditing) return;
    getClientePorCorreo(correo)
      .then((res) => {
        const { nombre, apellido, correo: c, telefono } = res.data;
        setForm({ nombre, apellido, correo: c, telefono });
      })
      .catch(() => alert('No se pudo cargar el cliente'))
      .finally(() => setFetching(false));
  }, [correo, isEditing]);

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!form.apellido.trim()) e.apellido = 'Requerido';
    if (!form.correo.trim()) e.correo = 'Requerido';
    if (!form.telefono.trim()) e.telefono = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEditing) {
        await actualizarCliente(correo, {
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono,
        });
      } else {
        await crearCliente(form);
      }
      navigate('/clientes');
    } catch (err) {
      alert(err.response?.data?.error ?? 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-zinc-400 font-mono text-sm">Cargando datos...</div>;
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar cliente' : 'Nuevo cliente'}
        subtitle={isEditing ? `Editando: ${correo}` : 'Registro de nuevo propietario'}
        actions={
          <Button size="sm" variant="ghost" onClick={() => navigate('/clientes')}>
            ← Volver
          </Button>
        }
      />

      <div className="p-4 md:p-8 max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 p-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              error={errors.nombre}
              placeholder="Juan"
              autoComplete="given-name"
            />
            <Input
              label="Apellido"
              value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              error={errors.apellido}
              placeholder="Pérez"
              autoComplete="family-name"
            />
          </div>
          <Input
            label="Correo electrónico"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
            error={errors.correo}
            disabled={isEditing}
            placeholder="cliente@email.cl"
          />
          <Input
            label="Teléfono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            error={errors.telefono}
            placeholder="+56 9 1234 5678"
          />

          <div className="flex gap-3 pt-2 border-t border-zinc-800">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear cliente'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/clientes')}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}