import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { crearPropiedad, actualizarPropiedad, getPropiedadPorId } from './propiedadService';
import { getClientes } from '../clientes/clienteService';
import { useAuth } from '../../store/authStore';

const TIPOS = ['Casa', 'Departamento', 'Comercial', 'Oficina', 'Bodega', 'Otro'];

export default function PropiedadForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [form, setForm] = useState({
    id_cliente: '',
    tipo_propiedad: 'Casa',
    direccion: '',
    comuna: '',
    info_adicional: '',
  });
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const init = async () => {
      try {
        const [clientesRes] = await Promise.all([getClientes()]);
        setClientes(clientesRes.data);

        if (isEditing) {
          const res = await getPropiedadPorId(id);
          const p = res.data;
          setForm({
            id_cliente: String(p.id_cliente),
            tipo_propiedad: p.tipo_propiedad,
            direccion: p.direccion,
            comuna: p.comuna,
            info_adicional: p.info_adicional ?? '',
          });
        }
      } catch {
        alert('Error al cargar datos');
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [id, isEditing]);

  const validate = () => {
    const e = {};
    if (!form.id_cliente) e.id_cliente = 'Seleccione un cliente';
    if (!form.direccion.trim()) e.direccion = 'Requerido';
    if (!form.comuna.trim()) e.comuna = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        id_usuario: parseInt(auth.usuario.id),
        id_cliente: parseInt(form.id_cliente),
        tipo_propiedad: form.tipo_propiedad,
        direccion: form.direccion,
        comuna: form.comuna,
        info_adicional: form.info_adicional || null,
      };

      if (isEditing) {
        await actualizarPropiedad(parseInt(id), payload);
      } else {
        await crearPropiedad(payload);
      }
      navigate('/propiedades');
    } catch (err) {
      alert(err.response?.data?.error ?? 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-zinc-400 font-mono text-sm">Cargando...</div>;

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar propiedad' : 'Nueva propiedad'}
        subtitle={isEditing ? `ID: ${id}` : 'Registro de inmueble'}
        actions={<Button variant="ghost" onClick={() => navigate('/propiedades')}>← Volver</Button>}
      />

      <div className="p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-6 space-y-5">
          <Select
            label="Cliente (propietario)"
            value={form.id_cliente}
            onChange={(e) => setForm({ ...form, id_cliente: e.target.value })}
            error={errors.id_cliente}
          >
            <option value="">Seleccionar cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.apellido} — {c.correo}
              </option>
            ))}
          </Select>

          <Select
            label="Tipo de propiedad"
            value={form.tipo_propiedad}
            onChange={(e) => setForm({ ...form, tipo_propiedad: e.target.value })}
          >
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>

          <Input
            label="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            error={errors.direccion}
            placeholder="Av. Principal 123"
          />
          <Input
            label="Comuna"
            value={form.comuna}
            onChange={(e) => setForm({ ...form, comuna: e.target.value })}
            error={errors.comuna}
            placeholder="Santiago"
          />
          <Textarea
            label="Información adicional (opcional)"
            value={form.info_adicional}
            onChange={(e) => setForm({ ...form, info_adicional: e.target.value })}
            placeholder="Detalles relevantes de la propiedad..."
          />

          <div className="flex gap-3 pt-2 border-t border-zinc-800">
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Registrar propiedad'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/propiedades')}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}