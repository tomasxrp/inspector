import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { getPropiedades, eliminarPropiedad } from './propiedadService';

const tipoBadge = (tipo) => {
  const map = { Casa: 'amber', Departamento: 'blue', Comercial: 'green', Oficina: 'default' };
  return map[tipo] ?? 'default';
};

export default function PropiedadesPage() {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchPropiedades = async () => {
    try {
      const res = await getPropiedades();
      setPropiedades(res.data);
    } catch {
      setError('No se pudieron cargar las propiedades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPropiedades(); }, []); // eslint-disable-line

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await eliminarPropiedad(deleteTarget.id);
      setPropiedades((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      alert('No se pudo eliminar la propiedad.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Propiedades"
        subtitle={`${propiedades.length} registros activos`}
        actions={
          <Button onClick={() => navigate('/propiedades/nueva')}>+ Nueva propiedad</Button>
        }
      />

      <div className="p-8">
        {loading && <LoadingSpinner text="Cargando propiedades..." />}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm font-mono">
            {error}
          </div>
        )}

        {!loading && !error && propiedades.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest mb-4">
              Sin propiedades registradas
            </p>
            <Button onClick={() => navigate('/propiedades/nueva')}>
              + Registrar primera propiedad
            </Button>
          </div>
        )}

        {!loading && propiedades.length > 0 && (
          <div className="grid gap-4">
            {propiedades.map((p) => (
              <div
                key={p.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-zinc-600 font-mono text-xs">#{p.id}</span>
                      <Badge variant={tipoBadge(p.tipo_propiedad)}>{p.tipo_propiedad}</Badge>
                    </div>
                    <h3 className="text-white font-mono font-semibold text-sm">{p.direccion}</h3>
                    <p className="text-zinc-500 font-mono text-xs mt-1">{p.comuna}</p>
                    {p.info_adicional && (
                      <p className="text-zinc-600 font-mono text-xs mt-1 truncate">
                        {p.info_adicional}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2 flex-shrink-0 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/propiedades/${p.id}/editar`)}
                    >
                      Editar
                    </Button>

                    {/* NUEVO: Revisiones asociadas */}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/propiedades/${p.id}/revisiones`)}
                    >
                      📋 Revisiones
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => navigate(`/revisiones/nueva?propiedadId=${p.id}`)}
                    >
                      + Revisión
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteTarget(p)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmar eliminación"
      >
        <p className="text-zinc-300 text-sm font-mono mb-6">
          ¿Eliminar la propiedad en{' '}
          <span className="text-amber-400">{deleteTarget?.direccion}</span>? Esta acción es
          irreversible.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}