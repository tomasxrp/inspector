import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
// eslint-disable-next-line 
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { crearRevision } from './revisionService';
import { getPropiedades } from '../propiedades/propiedadService';
import { useAuth } from '../../store/authStore';

const CATEGORIAS = [
  'Inspección general',
  'Revisión estructural',
  'Revisión eléctrica',
  'Revisión sanitaria',
  'Revisión de terminaciones',
  'Revisión de humedad',
  'Pre-entrega',
  'Post-venta',
];

export default function RevisionForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { auth } = useAuth();

  const [form, setForm] = useState({
    id_propiedad: searchParams.get('propiedadId') ?? '',
    categoria_observacion: CATEGORIAS[0],
    descripcion_general: '',
  });
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getPropiedades()
      .then((res) => setPropiedades(res.data))
      .catch(() => alert('Error al cargar propiedades'))
      .finally(() => setFetching(false));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.id_propiedad) e.id_propiedad = 'Seleccione una propiedad';
    if (!form.categoria_observacion) e.categoria_observacion = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await crearRevision({
        id_propiedad: parseInt(form.id_propiedad),
        id_usuario: parseInt(auth.usuario.id),
        categoria_observacion: form.categoria_observacion,
        descripcion_general: form.descripcion_general || null,
      });
      const nuevaRevision = res.data.revision;
      navigate(`/revisiones/${nuevaRevision.id}`);
    } catch (err) {
      alert(err.response?.data?.error ?? 'Error al crear revisión');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-zinc-400 font-mono text-sm">Cargando...</div>;

  return (
    <div>
      <PageHeader
        title="Nueva revisión"
        subtitle="Apertura de folio de inspección"
        actions={<Button variant="ghost" onClick={() => navigate('/revisiones')}>← Volver</Button>}
      />

      <div className="p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-6 space-y-5">
          <Select
            label="Propiedad a inspeccionar"
            value={form.id_propiedad}
            onChange={(e) => setForm({ ...form, id_propiedad: e.target.value })}
            error={errors.id_propiedad}
          >
            <option value="">Seleccionar propiedad...</option>
            {propiedades.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.tipo_propiedad}] {p.direccion} — {p.comuna}
              </option>
            ))}
          </Select>

          <Select
            label="Categoría de inspección"
            value={form.categoria_observacion}
            onChange={(e) => setForm({ ...form, categoria_observacion: e.target.value })}
            error={errors.categoria_observacion}
          >
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>

          <Textarea
            label="Descripción general (opcional)"
            value={form.descripcion_general}
            onChange={(e) => setForm({ ...form, descripcion_general: e.target.value })}
            placeholder="Observaciones generales sobre el estado de la propiedad..."
            rows={5}
          />

          <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-3">
            <p className="text-amber-400 text-xs font-mono">
              Al crear la revisión, serás redirigido al folio donde podrás registrar las fallas encontradas.
            </p>
          </div>

          <div className="flex gap-3 pt-2 border-t border-zinc-800">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando folio...' : 'Abrir folio de revisión →'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/revisiones')}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}