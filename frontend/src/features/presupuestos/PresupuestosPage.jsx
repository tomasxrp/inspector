import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { getPresupuestos, eliminarPresupuesto, descargarPdfPresupuesto } from './presupuestoService';
import { formatCLP } from './presupuestoConstants';
import { formatDisplayDate } from '../../utils/dateUtils';

export default function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    getPresupuestos()
      .then((data) => {
        if (isMounted) setPresupuestos(data);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await eliminarPresupuesto(deleteTarget.id);
      setPresupuestos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      alert('No se pudo eliminar el presupuesto.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDescargar = async (e, p) => {
    e.stopPropagation();
    setDownloadingId(p.id);
    try {
      await descargarPdfPresupuesto(p);
    } catch (err) {
      alert(`Error al generar PDF: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const filtrados = presupuestos.filter((p) => {
    const term = busqueda.toLowerCase();
    return (
      p.nombre_proyecto?.toLowerCase().includes(term) ||
      p.mandante?.toLowerCase().includes(term) ||
      p.contratista?.toLowerCase().includes(term) ||
      p.ubicacion?.toLowerCase().includes(term)
    );
  });

  const totalPresupuestado = presupuestos.reduce((acc, p) => acc + (p.totales?.totalPresupuesto || 0), 0);
  const costoDirectoTotal = presupuestos.reduce((acc, p) => acc + (p.totales?.costoDirecto || 0), 0);

  return (
    <div>
      <PageHeader
        title="Presupuestos NCh 1156"
        subtitle="Itemizados oficiales de obra • Estándar MINVU / MOP"
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => navigate('/presupuestos/nuevo')}>
              + Nuevo Presupuesto
            </Button>
          </div>
        }
      />

      <div className="p-4 md:p-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-5 transform hover:scale-[1.01] transition-transform">
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-1">Total Itemizados</p>
            <p className="text-3xl font-mono font-black text-white">{presupuestos.length}</p>
            <p className="text-zinc-500 font-mono text-[11px] mt-1">Bajo norma NCh 1156</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-5 transform hover:scale-[1.01] transition-transform">
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-1">Costo Directo Acumulado</p>
            <p className="text-2xl md:text-3xl font-mono font-black text-amber-400">{formatCLP(costoDirectoTotal)}</p>
            <p className="text-zinc-500 font-mono text-[11px] mt-1">Suma global de partidas (CD)</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-5 transform hover:scale-[1.01] transition-transform">
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-1">Total con IVA (19%)</p>
            <p className="text-2xl md:text-3xl font-mono font-black text-emerald-400">{formatCLP(totalPresupuestado)}</p>
            <p className="text-zinc-500 font-mono text-[11px] mt-1">Presupuestos finales aprobados</p>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar por proyecto, mandante, contratista o ubicación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {loading && <LoadingSpinner text="Cargando itemizados de presupuestos..." />}

        {!loading && filtrados.length === 0 && (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 p-8">
            <span className="text-4xl mb-3 block">🏗️</span>
            <p className="text-zinc-400 font-mono text-base font-bold uppercase tracking-wide mb-2">
              {busqueda ? 'No se encontraron presupuestos' : 'Sin presupuestos registrados'}
            </p>
            <p className="text-zinc-500 font-mono text-xs max-w-md mx-auto mb-6">
              Crea tu primer itemizado oficial bajo la norma NCh 1156 con jerarquía estricta, unidades oficiales y cálculo automático de GG, Utilidades e IVA.
            </p>
            <Button onClick={() => navigate('/presupuestos/nuevo')}>
              + Crear primer presupuesto
            </Button>
          </div>
        )}

        {!loading && filtrados.length > 0 && (
          <div className="grid gap-4">
            {filtrados.map((p) => {
              const items = p.items || [];
              const titulosCount = items.filter((it) => it.nivel === 1).length;
              const partidasCount = items.filter((it) => it.nivel === 2).length;
              const totales = p.totales || {};

              return (
                <div
                  key={p.id}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Información del Proyecto */}
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => navigate(`/presupuestos/${p.id}`)}
                    >
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-zinc-500 font-mono text-xs font-bold">
                          ITM-{String(p.id).padStart(4, '0')}
                        </span>
                        <Badge variant="amber">NCh 1156</Badge>
                        <span className="text-zinc-500 font-mono text-xs">
                          {formatDisplayDate(p.fecha)}
                        </span>
                      </div>

                      <h3 className="text-white font-mono font-bold text-base md:text-lg hover:text-amber-400 transition-colors">
                        {p.nombre_proyecto}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs font-mono text-zinc-400">
                        <p>
                          <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Mandante: </span>
                          <span className="text-zinc-200">{p.mandante}</span>
                        </p>
                        <p>
                          <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Contratista: </span>
                          <span className="text-zinc-200">{p.contratista}</span>
                        </p>
                        <p className="sm:col-span-2 truncate">
                          <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Ubicación: </span>
                          <span className="text-zinc-300">{p.ubicacion}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-800 text-xs font-mono text-zinc-500">
                        <span>{titulosCount} Títulos (Nivel 1)</span>
                        <span>•</span>
                        <span>{partidasCount} Partidas (Nivel 2)</span>
                        <span>•</span>
                        <span>GG: {totales.porcentajeGG ?? p.porcentaje_gg ?? 10}%</span>
                        <span>•</span>
                        <span>Util: {totales.porcentajeUtil ?? p.porcentaje_util ?? 10}%</span>
                      </div>
                    </div>

                    {/* Resumen Financiero y Acciones */}
                    <div className="flex flex-col items-start md:items-end justify-between gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800 min-w-[200px]">
                      <div className="text-left md:text-right">
                        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Total Presupuesto (con IVA)</p>
                        <p className="text-xl md:text-2xl font-mono font-black text-amber-400">
                          {formatCLP(totales.totalPresupuesto || 0)}
                        </p>
                        <p className="text-zinc-500 font-mono text-[11px] mt-0.5">
                          Neto: {formatCLP(totales.valorNeto || 0)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/presupuestos/${p.id}`)}
                          title="Ver documento oficial imprimible"
                        >
                          📄 Ver Doc
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/presupuestos/${p.id}/editar`)}
                        >
                          ✏️ Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={downloadingId === p.id}
                          onClick={(e) => handleDescargar(e, p)}
                        >
                          {downloadingId === p.id ? '...' : '⬇ PDF'}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(p);
                          }}
                        >
                          ✕
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

      {/* Modal confirmación eliminar */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar Presupuesto"
      >
        <div className="space-y-4">
          <p className="text-zinc-300 font-mono text-sm">
            ¿Está seguro de que desea eliminar el presupuesto del proyecto{' '}
            <strong className="text-amber-400 font-bold">{deleteTarget?.nombre_proyecto}</strong>?
          </p>
          <p className="text-zinc-500 font-mono text-xs">
            Esta acción no se puede deshacer y eliminará todas las partidas e itemizados calculados.
          </p>
          <div className="flex gap-3 justify-end pt-3 border-t border-zinc-800">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="danger" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
