import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import FallaCard from '../fallas/FallaCard';
import FallaForm from '../fallas/FallaForm';
import { getPropiedadPorId } from './propiedadService';
import { getRevisionesPorPropiedad, eliminarRevision } from '../revisiones/revisionService';
import { getClientes } from '../clientes/clienteService';
import { formatDisplayDate } from '../../utils/dateUtils';

const gravedadCount = (fallas, nivel) =>
  fallas.filter((f) => f.nivel_gravedad === nivel).length;

export default function PropiedadRevisiones() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [propiedad, setPropiedad] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [revisiones, setRevisiones] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [propRes, revRes] = await Promise.all([
        getPropiedadPorId(id),
        getRevisionesPorPropiedad(id),
      ]);
      const prop = propRes.data;
      setPropiedad(prop);
      setRevisiones(revRes.data.sort((a, b) => b.id - a.id));
      if (prop.id_cliente) {
        try {
          const clientesRes = await getClientes();
          const c = clientesRes.data.find((x) => x.id === prop.id_cliente);
          setCliente(c ?? null);
        } catch { /* ok */ }
      }
    } catch {
      alert('Error al cargar datos de la propiedad');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
  }, [fetchData]);

  const refreshRevision = useCallback(async () => {
    try {
      const res = await getRevisionesPorPropiedad(id);
      setRevisiones(res.data.sort((a, b) => b.id - a.id));
    } catch { /* ok */ }
  }, [id]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await eliminarRevision(deleteTarget.id);
      setRevisiones((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      if (expanded === deleteTarget.id) setExpanded(null);
      setDeleteTarget(null);
    } catch {
      alert('No se pudo eliminar la revisión.');
    } finally {
      setDeleting(false);
    }
  };

  const handleFallaDeleted = (revisionId, fallaId) => {
    setRevisiones((prev) =>
      prev.map((r) =>
        r.id === revisionId
          ? { ...r, fallas: r.fallas.filter((f) => f.id !== fallaId) }
          : r
      )
    );
  };

  if (loading) return <div className="p-8"><LoadingSpinner text="Cargando revisiones..." /></div>;

  return (
    <div>
      <PageHeader
        title="Revisiones"
        subtitle={propiedad ? `${propiedad.direccion}, ${propiedad.comuna}` : `Propiedad #${id}`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => navigate('/propiedades')}>
              ← Volver
            </Button>
            <Button size="sm" onClick={() => navigate(`/revisiones/nueva?propiedadId=${id}`)}>
              + Nueva
            </Button>
          </div>
        }
      />

      {/* Ficha de la propiedad */}
      {propiedad && (
        <div className="mx-4 md:mx-8 mt-4 bg-zinc-900 border border-zinc-800 p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-wide">Tipo</p>
            <p className="text-zinc-200 font-mono text-sm">{propiedad.tipo_propiedad}</p>
          </div>
          <div>
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-wide">Comuna</p>
            <p className="text-zinc-200 font-mono text-sm">{propiedad.comuna}</p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-wide">Dirección</p>
            <p className="text-zinc-200 font-mono text-sm">{propiedad.direccion}</p>
          </div>
          <div>
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-wide">Cliente</p>
            {cliente ? (
              <div>
                <p className="text-zinc-200 font-mono text-sm">
                  {cliente.nombre} {cliente.apellido}
                </p>
                <p className="text-zinc-500 font-mono text-xs truncate">{cliente.correo}</p>
              </div>
            ) : (
              <p className="text-zinc-500 font-mono text-xs">—</p>
            )}
          </div>
        </div>
      )}

      <div className="p-4 md:p-8 space-y-3">
        {revisiones.length === 0 && (
          <div className="text-center py-16 border border-dashed border-zinc-800">
            <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest mb-4">
              Sin revisiones para esta propiedad
            </p>
            <Button onClick={() => navigate(`/revisiones/nueva?propiedadId=${id}`)}>
              + Crear primera revisión
            </Button>
          </div>
        )}

        {revisiones.map((r) => {
          const isOpen = expanded === r.id;
          const fallas = r.fallas ?? [];
          const altaCount = gravedadCount(fallas, 'Alta');
          const mediaCount = gravedadCount(fallas, 'Media');
          const bajaCount = gravedadCount(fallas, 'Baja');

          return (
            <div
              key={r.id}
              className={`border transition-colors ${
                isOpen
                  ? 'border-amber-500/40 bg-zinc-900'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              {/* Cabecera */}
              <div className="p-4">
                <div
                  className="cursor-pointer mb-3"
                  onClick={() => setExpanded((p) => (p === r.id ? null : r.id))}
                >
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-zinc-600 font-mono text-xs">
                      FOL-{String(r.id).padStart(4, '0')}
                    </span>
                    <Badge variant="amber">{r.categoria_observacion}</Badge>
                    {r.informe_revision && <Badge variant="green">Con informe</Badge>}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-zinc-400 font-mono text-xs">
                      {formatDisplayDate(r.fecha_revision)}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold">
                      {altaCount > 0 && (
                        <span className="text-red-400">{altaCount}A</span>
                      )}
                      {mediaCount > 0 && (
                        <span className="text-amber-400">{mediaCount}M</span>
                      )}
                      {bajaCount > 0 && (
                        <span className="text-zinc-400">{bajaCount}B</span>
                      )}
                      {fallas.length === 0 && (
                        <span className="text-zinc-600 font-normal">Sin fallas</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpanded((p) => (p === r.id ? null : r.id))}
                  >
                    {isOpen ? '▲ Cerrar' : '▼ Fallas'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/revisiones/${r.id}/informe`)}
                  >
                    Informe
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setDeleteTarget(r)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>

              {/* Panel expandible */}
              {isOpen && (
                <div className="border-t border-zinc-800 px-4 pb-4 pt-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                      Fallas ({fallas.length})
                    </p>
                    <div className="flex gap-2">
                      {altaCount > 0 && <Badge variant="red">A: {altaCount}</Badge>}
                      {mediaCount > 0 && <Badge variant="amber">M: {mediaCount}</Badge>}
                      {bajaCount > 0 && <Badge>B: {bajaCount}</Badge>}
                    </div>
                  </div>

                  {fallas.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-zinc-800">
                      <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">
                        Sin fallas aún
                      </p>
                    </div>
                  )}

                  {fallas.map((falla) => (
                    <FallaCard
                      key={falla.id}
                      falla={falla}
                      onDeleted={(fallaId) => handleFallaDeleted(r.id, fallaId)}
                      onImageUploaded={refreshRevision}
                    />
                  ))}

                  <FallaForm idRevision={r.id} onCreated={refreshRevision} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar revisión"
      >
        <p className="text-zinc-300 text-sm font-mono mb-2">
          ¿Eliminar el folio{' '}
          <span className="text-amber-400">
            FOL-{String(deleteTarget?.id ?? 0).padStart(4, '0')}
          </span>?
        </p>
        <p className="text-zinc-500 text-xs font-mono mb-6">
          Se eliminarán también todas las fallas e imágenes. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar folio'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}