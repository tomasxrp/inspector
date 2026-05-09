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
      // Traemos propiedades y clientes en paralelo
      const [propRes, clientesRes] = await Promise.all([
        getPropiedades(),
        getClientes(),
      ]);
      const propiedades = propRes.data;
      const clientes = clientesRes.data;

      // Mapa rápido id_cliente → cliente
      const clienteMap = {};
      clientes.forEach((c) => { clienteMap[c.id] = c; });

      // Fetch revisiones de cada propiedad en paralelo
      const grupos = await Promise.all(
        propiedades.map((p) =>
          getRevisionesPorPropiedad(p.id)
            .then((r) =>
              r.data.map((rev) => ({
                ...rev,
                propiedad: {
                  ...p,
                  cliente: clienteMap[p.id_cliente] ?? null,
                },
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
        subtitle={`${revisiones.length} revisiones registradas`}
        actions={
          <Button onClick={() => navigate('/revisiones/nueva')}>+ Nueva revisión</Button>
        }
      />

      <div className="p-8">
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
              return (
                <div
                  key={r.id}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Info principal */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/revisiones/${r.id}`)}
                    >
                      {/* Folio + badges */}
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-zinc-600 font-mono text-xs">
                          FOL-{String(r.id).padStart(4, '0')}
                        </span>
                        <Badge variant="amber">{r.categoria_observacion}</Badge>
                        {r.informe_revision && <Badge variant="green">Con informe</Badge>}
                      </div>

                      {/* Datos de la propiedad */}
                      {prop ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 mb-2">
                          <div>
                            <p className="text-zinc-600 font-mono text-xs uppercase tracking-wide">
                              Dirección
                            </p>
                            <p className="text-white font-mono text-sm font-semibold truncate">
                              {prop.direccion}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-600 font-mono text-xs uppercase tracking-wide">
                              Comuna
                            </p>
                            <p className="text-zinc-200 font-mono text-sm">{prop.comuna}</p>
                          </div>
                          <div>
                            <p className="text-zinc-600 font-mono text-xs uppercase tracking-wide">
                              Cliente
                            </p>
                            {cliente ? (
                              <p className="text-zinc-200 font-mono text-sm">
                                {cliente.nombre} {cliente.apellido}
                                <span className="text-zinc-500 text-xs block truncate">
                                  {cliente.correo}
                                </span>
                              </p>
                            ) : (
                              <p className="text-zinc-500 font-mono text-xs">—</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-zinc-600 font-mono text-xs mb-2">Propiedad no disponible</p>
                      )}

                      {r.descripcion_general && (
                        <p className="text-zinc-600 font-mono text-xs truncate max-w-xl">
                          {r.descripcion_general}
                        </p>
                      )}
                    </div>

                    {/* Columna derecha: fecha + fallas + acciones */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-zinc-400 font-mono text-xs">
                          {formatDisplayDate(r.fecha_revision)}
                        </p>
                        <p className="text-zinc-600 font-mono text-xs mt-0.5">
                          {r.fallas?.length ?? 0} falla(s)
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/revisiones/${r.id}`)}
                        >
                          Ver →
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(r);
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal confirmación eliminación */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar revisión"
      >
        <p className="text-zinc-300 text-sm font-mono mb-2">
          ¿Eliminar el folio{' '}
          <span className="text-amber-400">
            FOL-{String(deleteTarget?.id ?? 0).padStart(4, '0')}
          </span>
          ?
        </p>
        {deleteTarget?.propiedad && (
          <p className="text-zinc-500 text-xs font-mono mb-6">
            Propiedad: {deleteTarget.propiedad.direccion}, {deleteTarget.propiedad.comuna}
          </p>
        )}
        <p className="text-zinc-500 text-xs font-mono mb-6">
          Se eliminarán también todas las fallas e imágenes asociadas. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar folio'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}