import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { getRevisionPorId } from '../revisiones/revisionService';
import { getInformePorRevision, crearInforme, actualizarInforme } from './informeService';
import { formatDisplayDate } from '../../utils/dateUtils';

const VEREDICTOS = [
  'Aprobado sin observaciones',
  'Aprobado con observaciones menores',
  'Aprobado con condiciones',
  'Rechazado — requiere reparaciones',
  'Rechazado — fallas estructurales críticas',
];

const gravedadVariant = (g) => {
  if (g === 'Alta') return 'red';
  if (g === 'Media') return 'amber';
  return 'default';
};

export default function InformePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [revision, setRevision] = useState(null);
  const [informe, setInforme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('datos'); // 'datos' | 'informe'

  const [form, setForm] = useState({
    veredicto_final: VEREDICTOS[0],
    observaciones_cliente: '',
  });

  useEffect(() => {
    const init = async () => {
      try {
        const revRes = await getRevisionPorId(id);
        setRevision(revRes.data);
        try {
          const infRes = await getInformePorRevision(id);
          const inf = infRes.data;
          setInforme(inf);
          setForm({
            veredicto_final: inf.veredicto_final,
            observaciones_cliente: inf.observaciones_cliente,
          });
        } catch {
          // No informe aún
        }
      } catch {
        alert('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.observaciones_cliente.trim()) {
      alert('Ingrese las observaciones para el cliente');
      return;
    }
    setSaving(true);
    try {
      if (informe) {
        const res = await actualizarInforme(parseInt(id), form);
        setInforme(res.data.informe);
      } else {
        const res = await crearInforme({
          id_revision: parseInt(id),
          veredicto_final: form.veredicto_final,
          observaciones_cliente: form.observaciones_cliente,
        });
        setInforme(res.data.informe);
      }
      alert('Informe guardado con éxito');
    } catch (err) {
      alert(err.response?.data?.error ?? 'Error al guardar informe');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8"><LoadingSpinner text="Cargando informe..." /></div>;
  if (!revision) return null;

  const fallas = revision.fallas ?? [];

  return (
    <div>
      <PageHeader
        title={`Informe — FOL-${String(revision.id).padStart(4, '0')}`}
        subtitle={informe ? 'Informe emitido' : 'Borrador'}
        actions={
          <Button size="sm" variant="ghost" onClick={() => navigate(`/revisiones/${id}`)}>
            ← Folio
          </Button>
        }
      />

      {/* Tabs para móvil */}
      <div className="flex border-b border-zinc-800 md:hidden">
        <button
          className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-colors ${
            activeTab === 'datos'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-zinc-500'
          }`}
          onClick={() => setActiveTab('datos')}
        >
          Datos
        </button>
        <button
          className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-colors ${
            activeTab === 'informe'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-zinc-500'
          }`}
          onClick={() => setActiveTab('informe')}
        >
          {informe ? 'Actualizar' : 'Emitir'} informe
        </button>
      </div>

      <div className="p-4 md:p-8 md:grid md:grid-cols-2 md:gap-6">
        {/* Panel izquierdo: Resumen */}
        <div
          className={`space-y-4 ${activeTab === 'informe' ? 'hidden md:block' : ''}`}
        >
          <div className="bg-zinc-900 border border-zinc-800 p-4">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Datos de la inspección
            </p>
            <dl className="space-y-3">
              <div>
                <dt className="text-zinc-600 font-mono text-xs uppercase tracking-wide">Fecha</dt>
                <dd className="text-zinc-200 font-mono text-sm">
                  {formatDisplayDate(revision.fecha_revision)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-600 font-mono text-xs uppercase tracking-wide">Categoría</dt>
                <dd className="text-zinc-200 font-mono text-sm">{revision.categoria_observacion}</dd>
              </div>
              {revision.propiedad && (
                <>
                  <div>
                    <dt className="text-zinc-600 font-mono text-xs uppercase tracking-wide">
                      Dirección
                    </dt>
                    <dd className="text-zinc-200 font-mono text-sm">
                      {revision.propiedad.direccion}, {revision.propiedad.comuna}
                    </dd>
                  </div>
                  {revision.propiedad.cliente && (
                    <div>
                      <dt className="text-zinc-600 font-mono text-xs uppercase tracking-wide">
                        Propietario
                      </dt>
                      <dd className="text-zinc-200 font-mono text-sm">
                        {revision.propiedad.cliente.nombre} {revision.propiedad.cliente.apellido}
                        <br />
                        <span className="text-zinc-500 text-xs">
                          {revision.propiedad.cliente.correo}
                        </span>
                      </dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Fallas registradas ({fallas.length})
            </p>
            {fallas.length === 0 && (
              <p className="text-zinc-600 font-mono text-xs">Sin fallas registradas</p>
            )}
            <div className="space-y-2">
              {fallas.map((f) => (
                <div
                  key={f.id}
                  className="flex items-start gap-3 py-2 border-b border-zinc-800 last:border-0"
                >
                  <Badge variant={gravedadVariant(f.nivel_gravedad)}>{f.nivel_gravedad}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 font-mono text-xs leading-relaxed">{f.descripcion}</p>
                    <p className="text-zinc-600 font-mono text-xs">{f.categoria_falla}</p>
                  </div>
                  {f.imagenes?.length > 0 && (
                    <span className="text-zinc-600 font-mono text-xs flex-shrink-0">
                      {f.imagenes.length} 📷
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho: Formulario informe */}
        <div className={activeTab === 'datos' ? 'hidden md:block' : ''}>
          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-5 space-y-5">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 pb-3 border-b border-zinc-800">
              {informe ? 'Actualizar informe' : 'Emitir informe oficial'}
            </p>

            <Select
              label="Veredicto final"
              value={form.veredicto_final}
              onChange={(e) => setForm({ ...form, veredicto_final: e.target.value })}
            >
              {VEREDICTOS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </Select>

            <Textarea
              label="Observaciones para el cliente"
              value={form.observaciones_cliente}
              onChange={(e) => setForm({ ...form, observaciones_cliente: e.target.value })}
              placeholder="Detalle las observaciones, recomendaciones y plazos..."
              rows={8}
            />

            {informe && (
              <div className="bg-green-500/10 border border-green-500/30 px-3 py-2">
                <p className="text-green-400 text-xs font-mono">
                  ✓ Emitido el {formatDisplayDate(informe.fecha_emision)}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t border-zinc-800">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Guardando...' : informe ? 'Actualizar' : 'Emitir informe'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/revisiones/${id}`)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}