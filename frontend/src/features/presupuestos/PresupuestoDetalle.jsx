import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { getPresupuestoPorId, descargarPdfPresupuesto } from './presupuestoService';
import { formatCLP, formatCantidad } from './presupuestoConstants';
import { formatDisplayDate } from '../../utils/dateUtils';

export default function PresupuestoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [presupuesto, setPresupuesto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getPresupuestoPorId(id)
      .then((data) => setPresupuesto(data))
      .catch((err) => {
        alert('Error al cargar presupuesto: ' + err.message);
        navigate('/presupuestos');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDescargar = async () => {
    if (!presupuesto) return;
    setDownloading(true);
    try {
      await descargarPdfPresupuesto(presupuesto);
    } catch (err) {
      alert(`Error al generar PDF: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner text="Cargando documento oficial..." />
      </div>
    );
  }

  if (!presupuesto) return null;

  const { items = [], totales = {} } = presupuesto;
  const cd = totales.costoDirecto || 0;
  const ggPct = totales.porcentajeGG ?? presupuesto.porcentaje_gg ?? 10;
  const gg = totales.gastosGenerales || Math.round(cd * (ggPct / 100));
  const utilPct = totales.porcentajeUtil ?? presupuesto.porcentaje_util ?? 10;
  const util = totales.utilidades || Math.round(cd * (utilPct / 100));
  const neto = totales.valorNeto || cd + gg + util;
  const iva = totales.iva || Math.round(neto * 0.19);
  const total = totales.totalPresupuesto || neto + iva;

  return (
    <div className="pb-16 print:p-0 print:pb-0">
      {/* Botones de acción en pantalla (ocultos al imprimir) */}
      <div className="print:hidden">
        <PageHeader
          title={`Documento Oficial — ITM-${String(presupuesto.id || '001').padStart(4, '0')}`}
          subtitle="Formato oficial NCh 1156 listo para presentación y firma"
          actions={
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="ghost" onClick={() => navigate('/presupuestos')}>
                ← Listado
              </Button>
              <Button size="sm" variant="secondary" onClick={() => navigate(`/presupuestos/${id}/editar`)}>
                ✏️ Editar
              </Button>
              <Button size="sm" variant="ghost" onClick={handlePrint}>
                🖨️ Imprimir
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={downloading}
                onClick={handleDescargar}
              >
                {downloading ? 'Generando...' : '⬇ Descargar PDF Oficial'}
              </Button>
            </div>
          }
        />
      </div>

      {/* Contenedor del Documento Formal (Simulación de Hoja Oficial Membretada) */}
      <div className="p-4 md:p-8 max-w-5xl mx-auto print:max-w-none print:p-0">
        <div className="bg-white text-zinc-900 border border-zinc-300 shadow-2xl p-6 md:p-10 font-mono text-xs print:border-none print:shadow-none print:p-4">
          
          {/* Banda decorativa superior */}
          <div className="h-1.5 bg-amber-500 w-full mb-6 print:bg-zinc-800" />

          {/* ENCABEZADO OFICIAL */}
          <div className="text-center pb-6 border-b border-zinc-300 mb-6">
            <h1 className="text-lg md:text-xl font-black uppercase tracking-wider text-zinc-900">
              ITEMIZADO OFICIAL — PRESUPUESTO POR PARTIDAS
            </h1>
            <p className="text-zinc-600 text-[11px] mt-1 font-semibold">
              NORMA CHILENA OFICIAL NCh 1156 • ESTÁNDAR TÉCNICO MINVU / MOP
            </p>
          </div>

          {/* CUADRO DE METADATOS DEL PROYECTO */}
          <div className="bg-zinc-50 border border-zinc-300 p-4 mb-6 text-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-6">
              <div>
                <p>
                  <strong className="text-zinc-900">NOMBRE DEL PROYECTO:</strong>{' '}
                  <span className="font-semibold">{presupuesto.nombre_proyecto}</span>
                </p>
              </div>
              <div>
                <p>
                  <strong className="text-zinc-900">CONTRATISTA:</strong>{' '}
                  <span>{presupuesto.contratista}</span>
                </p>
              </div>
              <div>
                <p>
                  <strong className="text-zinc-900">MANDANTE:</strong>{' '}
                  <span>{presupuesto.mandante}</span>
                </p>
              </div>
              <div>
                <p>
                  <strong className="text-zinc-900">FECHA:</strong>{' '}
                  <span>{formatDisplayDate(presupuesto.fecha)}</span>
                </p>
              </div>
              <div className="md:col-span-2">
                <p>
                  <strong className="text-zinc-900">UBICACIÓN:</strong>{' '}
                  <span>{presupuesto.ubicacion}</span>
                </p>
              </div>
            </div>
          </div>

          {/* CUERPO: TABLA LIMPIA SEGÚN NCh 1156 */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-zinc-300">
              <thead>
                <tr className="bg-zinc-900 text-white uppercase text-[10px] tracking-wider font-bold">
                  <th className="border border-zinc-400 py-2.5 px-2 text-center w-14">ÍTEM</th>
                  <th className="border border-zinc-400 py-2.5 px-3 text-left">DESCRIPCIÓN</th>
                  <th className="border border-zinc-400 py-2.5 px-2 text-center w-16">UNIDAD</th>
                  <th className="border border-zinc-400 py-2.5 px-2 text-right w-20">CANTIDAD</th>
                  <th className="border border-zinc-400 py-2.5 px-2 text-right w-28">P.UNITARIO ($)</th>
                  <th className="border border-zinc-400 py-2.5 px-3 text-right w-32">TOTAL ($)</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {items.map((it, idx) => {
                  const isTitulo = it.nivel === 1;

                  if (isTitulo) {
                    return (
                      <tr key={idx} className="bg-zinc-100 font-bold border-t-2 border-b-2 border-zinc-400">
                        <td className="border border-zinc-300 py-2 px-2 text-center font-black text-zinc-950">
                          {it.codigo}
                        </td>
                        <td className="border border-zinc-300 py-2 px-3 uppercase text-zinc-950">
                          {it.descripcion}
                        </td>
                        <td className="border border-zinc-300 py-2 px-2 text-center text-zinc-400">-</td>
                        <td className="border border-zinc-300 py-2 px-2 text-right text-zinc-400">-</td>
                        <td className="border border-zinc-300 py-2 px-2 text-right text-zinc-400">-</td>
                        <td className="border border-zinc-300 py-2 px-3 text-right font-black text-zinc-950">
                          {formatCLP(it.total)}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={idx} className={idx % 2 === 1 ? 'bg-zinc-50' : 'bg-white'}>
                      <td className="border border-zinc-300 py-1.5 px-2 text-center text-zinc-700">
                        {it.codigo}
                      </td>
                      <td className="border border-zinc-300 py-1.5 px-3 text-zinc-800 pl-4">
                        {it.descripcion}
                      </td>
                      <td className="border border-zinc-300 py-1.5 px-2 text-center font-bold text-zinc-600">
                        {it.unidad}
                      </td>
                      <td className="border border-zinc-300 py-1.5 px-2 text-right text-zinc-800">
                        {formatCantidad(it.cantidad)}
                      </td>
                      <td className="border border-zinc-300 py-1.5 px-2 text-right text-zinc-800">
                        {formatCLP(it.precio_unitario)}
                      </td>
                      <td className="border border-zinc-300 py-1.5 px-3 text-right font-semibold text-zinc-900">
                        {formatCLP(it.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PIE DE PÁGINA: DESGLOSE FINANCIERO ALINEADO A LA DERECHA */}
          <div className="flex justify-end mb-12">
            <div className="w-full sm:w-80 border border-zinc-300 bg-zinc-50 p-4 space-y-2 text-[11px]">
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-600">Costo Directo (CD):</span>
                <span className="font-semibold text-zinc-900">{formatCLP(cd)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-600">Gastos Generales ({ggPct}%):</span>
                <span className="text-zinc-900">{formatCLP(gg)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-600">Utilidades ({utilPct}%):</span>
                <span className="text-zinc-900">{formatCLP(util)}</span>
              </div>
              <div className="border-t border-zinc-300 pt-2 flex justify-between font-bold text-xs">
                <span className="text-zinc-900">VALOR NETO:</span>
                <span className="text-zinc-950">{formatCLP(neto)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-600">I.V.A. (19%):</span>
                <span className="text-zinc-900">{formatCLP(iva)}</span>
              </div>
              <div className="border-t-2 border-zinc-900 pt-2 flex justify-between font-black text-sm bg-zinc-900 text-white p-2">
                <span>TOTAL PRESUPUESTO:</span>
                <span className="text-amber-400">{formatCLP(total)}</span>
              </div>
            </div>
          </div>

          {/* BLOQUE DE FIRMAS REGLAMENTARIAS */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-300 text-center">
            <div>
              <div className="border-b border-zinc-900 mx-auto w-48 mb-2" />
              <p className="font-bold text-zinc-900 uppercase text-[10px]">
                CONSTRUCTOR / CONTRATISTA
              </p>
              <p className="text-zinc-500 text-[9px] mt-0.5">{presupuesto.contratista}</p>
            </div>
            <div>
              <div className="border-b border-zinc-900 mx-auto w-48 mb-2" />
              <p className="font-bold text-zinc-900 uppercase text-[10px]">
                MANDANTE / PROPIETARIO
              </p>
              <p className="text-zinc-500 text-[9px] mt-0.5">{presupuesto.mandante}</p>
            </div>
          </div>

          {/* Pie de página institucional */}
          <div className="mt-8 pt-4 border-t border-zinc-200 text-center text-[9px] text-zinc-400">
            Documento Técnico Emitido conforme a la Norma Chilena Oficial NCh 1156 • Inspect App v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
