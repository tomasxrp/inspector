import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import FallaCard from '../fallas/FallaCard';
import FallaForm from '../fallas/FallaForm';
import { getRevisionPorId } from './revisionService';
import { formatDisplayDate } from '../../utils/dateUtils';

const gravedadCount = (fallas, nivel) =>
  fallas.filter((f) => f.nivel_gravedad === nivel).length;

export default function RevisionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRevision = useCallback(async () => {
    try {
      const res = await getRevisionPorId(id);
      setRevision(res.data);
    } catch {
      setError('No se pudo cargar la revisión.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // eslint-disable-next-line 
  useEffect(() => { fetchRevision(); }, [fetchRevision]);

  const handleFallaDeleted = (fallaId) => {
    setRevision((prev) => ({
      ...prev,
      fallas: prev.fallas.filter((f) => f.id !== fallaId),
    }));
  };

  if (loading) return <div className="p-8"><LoadingSpinner text="Cargando folio..." /></div>;
  if (error) return <div className="p-8 text-red-400 font-mono text-sm">{error}</div>;
  if (!revision) return null;

  const fallas = revision.fallas ?? [];
  const altaCount = gravedadCount(fallas, 'Alta');
  const mediaCount = gravedadCount(fallas, 'Media');
  const bajaCount = gravedadCount(fallas, 'Baja');

  return (
    <div>
      <PageHeader
        title={`FOL-${String(revision.id).padStart(4, '0')}`}
        subtitle={`Revisión del ${formatDisplayDate(revision.fecha_revision)}`}
        actions={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/revisiones')}>← Revisiones</Button>
            {revision.informe_revision ? (
              <Button variant="secondary" onClick={() => navigate(`/revisiones/${id}/informe`)}>
                Ver informe →
              </Button>
            ) : (
              <Button onClick={() => navigate(`/revisiones/${id}/informe`)}>
                Generar informe →
              </Button>
            )}
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Propiedad info */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 col-span-2">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500 mb-3">Datos de la inspección</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <p className="text-zinc-600 font-mono text-xs uppercase tracking-wide">Categoría</p>
                <p className="text-zinc-200 font-mono text-sm">{revision.categoria_observacion}</p>
              </div>
              <div>
                <p className="text-zinc-600 font-mono text-xs uppercase tracking-wide">Fecha</p>
                <p className="text-zinc-200 font-mono text-sm">{formatDisplayDate(revision.fecha_revision)}</p>
              </div>
              {revision.propiedad && (
                <>
                  <div>
                    <p className="text-zinc-600 font-mono text-xs uppercase tracking-wide">Dirección</p>
                    <p className="text-zinc-200 font-mono text-sm">{revision.propiedad.direccion}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 font-mono text-xs uppercase tracking-wide">Comuna</p>
                    <p className="text-zinc-200 font-mono text-sm">{revision.propiedad.comuna}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 font-mono text-xs uppercase tracking-wide">Tipo</p>
                    <p className="text-zinc-200 font-mono text-sm">{revision.propiedad.tipo_propiedad}</p>
                  </div>
                  {revision.propiedad.cliente && (
                    <div>
                      <p className="text-zinc-600 font-mono text-xs uppercase tracking-wide">Propietario</p>
                      <p className="text-zinc-200 font-mono text-sm">
                        {revision.propiedad.cliente.nombre} {revision.propiedad.cliente.apellido}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            {revision.descripcion_general && (
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <p className="text-zinc-600 font-mono text-xs uppercase tracking-wide mb-1">Descripción general</p>
                <p className="text-zinc-400 font-mono text-xs">{revision.descripcion_general}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-zinc-900 border border-zinc-800 p-4">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500 mb-3">Resumen fallas</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="red">Alta</Badge>
                <span className="font-mono font-black text-2xl text-red-400">{altaCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="amber">Media</Badge>
                <span className="font-mono font-black text-2xl text-amber-400">{mediaCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge>Baja</Badge>
                <span className="font-mono font-black text-2xl text-zinc-400">{bajaCount}</span>
              </div>
              <div className="border-t border-zinc-800 pt-2 flex items-center justify-between">
                <span className="text-zinc-500 font-mono text-xs uppercase tracking-wide">Total</span>
                <span className="font-mono font-black text-2xl text-white">{fallas.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informe badge */}
        {revision.informe_revision && (
          <div className="bg-green-500/10 border border-green-500/30 px-4 py-3 flex items-center justify-between">
            <p className="text-green-400 text-xs font-mono">
              ✓ Esta revisión tiene un informe oficial emitido.
            </p>
            <Button size="sm" variant="ghost" onClick={() => navigate(`/revisiones/${id}/informe`)}>
              Ver informe →
            </Button>
          </div>
        )}

        {/* Fallas section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-zinc-300">
              Fallas registradas ({fallas.length})
            </h2>
          </div>

          <div className="space-y-3">
            {fallas.length === 0 && (
              <div className="text-center py-8 border border-dashed border-zinc-800">
                <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">
                  Sin fallas registradas aún
                </p>
              </div>
            )}
            {fallas.map((falla) => (
              <FallaCard
                key={falla.id}
                falla={falla}
                onDeleted={handleFallaDeleted}
                onImageUploaded={fetchRevision}
              />
            ))}

            <FallaForm idRevision={id} onCreated={fetchRevision} />
          </div>
        </div>
      </div>
    </div>
  );
}