import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { getPropiedades } from '../propiedades/propiedadService';
import { getRevisionesPorPropiedad } from './revisionService';
import { formatDisplayDate } from '../../utils/dateUtils';

export default function RevisionesPage() {
    // eslint-disable-next-line 
  const [propiedades, setPropiedades] = useState([]);
  const [revisiones, setRevisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getPropiedades();
        setPropiedades(res.data);
        // Fetch all revisiones for all propiedades
        const all = await Promise.all(
          res.data.map((p) =>
            getRevisionesPorPropiedad(p.id)
              .then((r) => r.data.map((rev) => ({ ...rev, propiedad: p })))
              .catch(() => [])
          )
        );
        setRevisiones(all.flat().sort((a, b) => b.id - a.id));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

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
            <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest mb-4">Sin revisiones registradas</p>
            <Button onClick={() => navigate('/revisiones/nueva')}>+ Crear primera revisión</Button>
          </div>
        )}

        {!loading && revisiones.length > 0 && (
          <div className="grid gap-3">
            {revisiones.map((r) => (
              <div
                key={r.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-colors p-4 cursor-pointer"
                onClick={() => navigate(`/revisiones/${r.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-zinc-600 font-mono text-xs">FOL-{String(r.id).padStart(4, '0')}</span>
                      <Badge variant="amber">{r.categoria_observacion}</Badge>
                      {r.informe_revision && <Badge variant="green">Con informe</Badge>}
                    </div>
                    <p className="text-white font-mono text-sm font-semibold">{r.propiedad?.direccion}</p>
                    <p className="text-zinc-500 font-mono text-xs">{r.propiedad?.comuna} — {r.propiedad?.tipo_propiedad}</p>
                    {r.descripcion_general && (
                      <p className="text-zinc-600 font-mono text-xs mt-1 truncate max-w-xl">{r.descripcion_general}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-zinc-400 font-mono text-xs">{formatDisplayDate(r.fecha_revision)}</p>
                    <p className="text-zinc-600 font-mono text-xs mt-1">{r.fallas?.length ?? 0} falla(s)</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}