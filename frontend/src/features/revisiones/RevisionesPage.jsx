import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { getPropiedades } from '../propiedades/propiedadService';
import { getRevisionesPorPropiedad, eliminarRevision } from './revisionService';
import { getClientes } from '../clientes/clienteService';
import { formatDisplayDate } from '../../utils/dateUtils';

export default function RevisionesPage() {
  const [revisiones, setRevisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchAll = async () => {
    try {
      const [propRes, clientesRes] = await Promise.all([
        getPropiedades(),
        getClientes(),
      ]);
      const propiedades = propRes.data;
      const clientes = clientesRes.data;
      const clienteMap = {};
      clientes.forEach((c) => { clienteMap[c.id] = c; });

      const grupos = await Promise.all(
        propiedades.map((p) =>
          getRevisionesPorPropiedad(p.id)
            .then((r) =>
              r.data.map((rev) => ({
                ...rev,
                propiedad: { ...p, cliente: clienteMap[p.id_cliente] ?? null },
              }))
            )
            .catch(() => [])
        )
      );
      setRevisiones(grupos.flat().sort((a, b) => b.id - a.id));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await eliminarRevision(deleteTarget.id);
      setRevisiones((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      alert('No se pudo eliminar la revisión.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Revisiones"
        subtitle={`${revisiones.length} revisiones`}
        actions={
          <Button size="sm" onClick={() => navigate('/revisiones/nueva')}>
            + Nueva
          </Button>
        }
      />

      <div className="p-4 md:p-8">
        {loading && <LoadingSpinner text="Cargando revisiones..." />}

        {!loading && revisiones.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest mb-4">
              Sin revisiones registradas
            </p>
            <Button onClick={() => navigate('/revisiones/nueva')}>+ Crear primera revisión</Button>
          </div>
        )}

        {!loading && revisiones.length > 0 && (
          <div className="grid gap-3">
            {revisiones.map((r) => {
              const prop = r.propiedad;
              const cliente = prop?.cliente;
              const fallasCount = r.fallas?.length ?? 0;

              return (
                <div
                  key={r.id}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors p-4"
                >
                  {/* Header del card */}
                  <div
                    className="cursor-pointer"
                    onClick={() => navigate(`/revisiones/${r.id}`)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-zinc-600 font-mono text-xs">
                          FOL-{String(r.id).padStart(4, '0')}
                        </span>
                        <Badge variant="amber">{r.categoria_observacion}</Badge>
                        {r.informe_revision && <Badge variant="green">✓ Informe</Badge>}
                      </div>
                      <p className="text-zinc-500 font-mono text-xs flex-shrink-0">
                        {formatDisplayDate(r.fecha_revision)}
                      </p>
                    </div>

                    {prop && (
                      <div className="mb-2">
                        <p className="text-white font-mono text-sm font-semibold leading-snug">
                          {prop.direccion}
                        </p>
                        <p className="text-zinc-500 font-mono text-xs">
                          {prop.comuna}
                          {cliente && ` · ${cliente.nombre} ${cliente.apellido}`}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs font-mono">
                      {fallasCount > 0 ? (
                        <>
                          {r.fallas?.filter((f) => f.nivel_gravedad === 'Alta').length > 0 && (
                            <span className="text-red-400 font-bold">
                              {r.fallas.filter((f) => f.nivel_gravedad === 'Alta').length} alta(s)
                            </span>
                          )}
                          {r.fallas?.filter((f) => f.nivel_gravedad === 'Media').length > 0 && (
                            <span className="text-amber-400 font-bold">
                              {r.fallas.filter((f) => f.nivel_gravedad === 'Media').length} media(s)
                            </span>
                          )}
                          {r.fallas?.filter((f) => f.nivel_gravedad === 'Baja').length > 0 && (
                            <span className="text-zinc-400">
                              {r.fallas.filter((f) => f.nivel_gravedad === 'Baja').length} baja(s)
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-zinc-600">Sin fallas registradas</span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-3 mt-3 border-t border-zinc-800">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => navigate(`/revisiones/${r.id}`)}
                    >
                      Ver folio →
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(r);
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
          Se eliminarán también todas las fallas e imágenes asociadas. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}