import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import {
  getPresupuestoPorId,
  crearPresupuesto,
  actualizarPresupuesto,
  descargarPdfPresupuesto,
  getPlantillas,
  crearPlantilla,
} from './presupuestoService';
import {
  UNIDADES_NCH1156,
  PLANTILLAS_PREDEFINIDAS,
  calcularPresupuestoLocal,
  formatCLP,
} from './presupuestoConstants';

export default function PresupuestoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const defaultTemplate = PLANTILLAS_PREDEFINIDAS[0];

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Datos del Proyecto (Encabezado)
  const [nombreProyecto, setNombreProyecto] = useState(
    () => (isEditing ? '' : 'Construcción Vivienda Social Modelo NCh 1156')
  );
  const [mandante, setMandante] = useState(
    () => (isEditing ? '' : 'Servicio de Vivienda y Urbanización (SERVIU)')
  );
  const [contratista, setContratista] = useState(
    () => (isEditing ? '' : 'Constructora e Ingeniería Los Andes SpA')
  );
  const [ubicacion, setUbicacion] = useState(
    () => (isEditing ? '' : 'Av. Las Acacias 1420, Maipú, Región Metropolitana')
  );
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);

  // Parámetros Financieros
  const [porcentajeGG, setPorcentajeGG] = useState(() => (isEditing ? 10 : defaultTemplate.porcentaje_gg));
  const [porcentajeUtil, setPorcentajeUtil] = useState(() => (isEditing ? 10 : defaultTemplate.porcentaje_util));

  // Lista jerárquica de Ítems (Nivel 1 Títulos y Nivel 2 Partidas)
  const [items, setItems] = useState(() => (isEditing ? [] : defaultTemplate.items));

  // Plantillas
  const [plantillas, setPlantillas] = useState([]);
  const [selectedPlantillaId, setSelectedPlantillaId] = useState('');
  const [savingPlantilla, setSavingPlantilla] = useState(false);

  // Cargar si estamos editando y cargar plantillas
  useEffect(() => {
    let isMounted = true;
    const fetchPlantillas = async () => {
      try {
        const data = await getPlantillas();
        if (isMounted) setPlantillas(data);
      } catch (err) {
        console.error('Error fetching plantillas:', err);
      }
    };
    fetchPlantillas();

    if (!isEditing) return;
    
    getPresupuestoPorId(id)
      .then((data) => {
        if (!isMounted) return;
        setNombreProyecto(data.nombre_proyecto || '');
        setMandante(data.mandante || '');
        setContratista(data.contratista || '');
        setUbicacion(data.ubicacion || '');
        setFecha(data.fecha ? data.fecha.split('T')[0] : new Date().toISOString().split('T')[0]);
        setPorcentajeGG(data.porcentaje_gg ?? 10);
        setPorcentajeUtil(data.porcentaje_util ?? 10);
        setItems(data.items || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        alert('Error al cargar presupuesto: ' + err.message);
        navigate('/presupuestos');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [id, isEditing, navigate]);


  // Cálculos en tiempo real según NCh 1156
  const calculo = useMemo(() => {
    return calcularPresupuestoLocal(items, porcentajeGG, porcentajeUtil);
  }, [items, porcentajeGG, porcentajeUtil]);

  // Manejo de Plantillas
  const handleCargarPlantilla = (plantillaId) => {
    if (!plantillaId) return;
    
    if (plantillaId === 'BLANCO') {
      if (items.length > 0 && !confirm('¿Desea borrar todo el itemizado actual para empezar desde cero?')) {
        return;
      }
      setPorcentajeGG(10);
      setPorcentajeUtil(10);
      setItems([]);
      setNombreProyecto('');
      setMandante('');
      setContratista('');
      setUbicacion('');
      return;
    }

    const t = plantillas.find((p) => p.id === parseInt(plantillaId, 10)) || PLANTILLAS_PREDEFINIDAS.find(p => p.id === plantillaId);
    if (!t) return;
    if (items.length > 0 && !confirm('¿Desea reemplazar el itemizado actual con la plantilla seleccionada?')) {
      return;
    }
    setPorcentajeGG(t.porcentaje_gg || 10);
    setPorcentajeUtil(t.porcentaje_util || 10);
    setItems(t.items);
  };

  const handleGuardarComoPlantilla = async () => {
    if (items.length === 0) {
      alert('No hay ítems para guardar como plantilla.');
      return;
    }
    const nombre = prompt('Ingrese un nombre para esta nueva plantilla:');
    if (!nombre) return;

    setSavingPlantilla(true);
    try {
      const nuevaPlantilla = await crearPlantilla({
        nombre,
        items,
      });
      setPlantillas([nuevaPlantilla, ...plantillas]);
      alert('Plantilla guardada exitosamente.');
    } catch (err) {
      alert('Error al guardar plantilla: ' + err.message);
    } finally {
      setSavingPlantilla(false);
    }
  };


  // Re-enumerar jerárquicamente conforme a NCh 1156 (1.0, 1.1, 1.2, 2.0, 2.1...)
  const autoNumerarJerarquia = (itemsList) => {
    let tituloCount = 0;
    let partidaCount = 0;

    return itemsList.map((it) => {
      if (it.nivel === 1) {
        tituloCount++;
        partidaCount = 0;
        return {
          ...it,
          codigo: `${tituloCount}.0`,
        };
      } else {
        partidaCount++;
        const prefijo = tituloCount > 0 ? tituloCount : 1;
        return {
          ...it,
          codigo: `${prefijo}.${partidaCount}`,
        };
      }
    });
  };

  // Agregar Título Nivel 1
  const handleAddTitulo = () => {
    const titulosExistentes = items.filter((it) => it.nivel === 1).length;
    const nuevoCodigo = `${titulosExistentes + 1}.0`;
    const nuevo = {
      id: `tit-${Date.now()}`,
      nivel: 1,
      codigo: nuevoCodigo,
      descripcion: 'NUEVO CAPÍTULO / TÍTULO',
      unidad: '',
      cantidad: null,
      precio_unitario: null,
      total: 0,
    };
    setItems(autoNumerarJerarquia([...items, nuevo]));
  };

  // Agregar Partida Nivel 2
  const handleAddPartida = (indexDespues) => {
    const idx = indexDespues !== undefined ? indexDespues : items.length - 1;
    const nuevo = {
      id: `par-${Date.now()}`,
      nivel: 2,
      codigo: '',
      descripcion: 'Nueva partida técnica',
      unidad: 'm2',
      cantidad: 1.0,
      precio_unitario: 10000,
      total: 10000,
    };

    const copia = [...items];
    copia.splice(idx + 1, 0, nuevo);
    setItems(autoNumerarJerarquia(copia));
  };

  // Modificar campo de una partida/título
  const handleChangeItem = (index, field, value) => {
    setItems((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [field]: value };
      return copia;
    });
  };

  // Eliminar ítem
  const handleDeleteItem = (index) => {
    const copia = items.filter((_, i) => i !== index);
    setItems(autoNumerarJerarquia(copia));
  };

  // Mover fila arriba/abajo
  const handleMove = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const copia = [...items];
    const temp = copia[index];
    copia[index] = copia[targetIdx];
    copia[targetIdx] = temp;
    setItems(autoNumerarJerarquia(copia));
  };

  // Guardar formulario
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!nombreProyecto.trim() || !mandante.trim() || !contratista.trim() || !ubicacion.trim()) {
      alert('Por favor complete todos los datos obligatorios del encabezado del proyecto.');
      return;
    }
    if (items.length === 0) {
      alert('El itemizado debe contener al menos un título y una partida.');
      return;
    }

    if (!calculo.valido && calculo.errores.length > 0) {
      alert('Existen errores de validación NCh 1156:\n• ' + calculo.errores.slice(0, 5).join('\n• '));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre_proyecto: nombreProyecto.trim(),
        mandante: mandante.trim(),
        contratista: contratista.trim(),
        ubicacion: ubicacion.trim(),
        fecha: new Date(fecha).toISOString(),
        porcentaje_gg: Number(porcentajeGG),
        porcentaje_util: Number(porcentajeUtil),
        items: calculo.items,
        totales: calculo.totales,
      };

      let res;
      if (isEditing) {
        res = await actualizarPresupuesto(id, payload);
      } else {
        res = await crearPresupuesto(payload);
      }

      alert('Presupuesto guardado exitosamente conforme a NCh 1156.');
      navigate(`/presupuestos/${res.id || id}`);
    } catch (err) {
      alert('Error al guardar presupuesto: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Descarga directa de PDF
  const handleDescargarPdf = async () => {
    setDownloading(true);
    try {
      await descargarPdfPresupuesto({
        id: id || 'BORRADOR',
        nombre_proyecto: nombreProyecto,
        mandante,
        contratista,
        ubicacion,
        fecha,
        porcentaje_gg: porcentajeGG,
        porcentaje_util: porcentajeUtil,
        items: calculo.items,
        totales: calculo.totales,
      });
    } catch (err) {
      alert(`Error al generar PDF: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner text="Cargando itemizado..." />
      </div>
    );
  }

  const { totales, errores, advertencias } = calculo;

  return (
    <div className="pb-16">
      <PageHeader
        title={isEditing ? `Editar Itemizado — ITM-${String(id).padStart(4, '0')}` : 'Nuevo Itemizado Oficial NCh 1156'}
        subtitle="Constructor y Presupuestos de Obra • MINVU / MOP"
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="ghost" onClick={() => navigate('/presupuestos')}>
              ← Volver
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={downloading}
              onClick={handleDescargarPdf}
            >
              {downloading ? 'Generando...' : '⬇ PDF Oficial'}
            </Button>
            <Button size="sm" variant="primary" disabled={saving} onClick={handleSubmit}>
              {saving ? 'Guardando...' : '💾 Guardar Presupuesto'}
            </Button>
          </div>
        }
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Plantillas Rápidas */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-zinc-200 font-mono text-xs font-bold uppercase tracking-wider">
              Plantillas de Presupuesto
            </p>
            <p className="text-zinc-500 font-mono text-[11px]">
              Cargue estructuras estándar o cree nuevas plantillas para reusar en el futuro.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <select
              value={selectedPlantillaId}
              onChange={(e) => {
                setSelectedPlantillaId(e.target.value);
                handleCargarPlantilla(e.target.value);
              }}
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-500 rounded-none w-64"
            >
              <option value="">-- Seleccionar Plantilla --</option>
              <option value="BLANCO">📄 Nueva Plantilla en Blanco</option>
              {plantillas.length > 0 && (
                <optgroup label="Plantillas Personalizadas">
                  {plantillas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (ID: {p.id})
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Plantillas Predefinidas">
                {PLANTILLAS_PREDEFINIDAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </optgroup>
            </select>
            <Button
              size="sm"
              variant="outline"
              disabled={savingPlantilla}
              onClick={handleGuardarComoPlantilla}
            >
              {savingPlantilla ? 'Guardando...' : '💾 Guardar como Plantilla'}
            </Button>
          </div>
        </div>

        {/* Formulario Encabezado de Proyecto */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-amber-400">
              1. Antecedentes del Proyecto (Encabezado Oficial)
            </h2>
            <Badge variant="amber">Obligatorio NCh 1156</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Nombre del Proyecto"
              placeholder="Ej: Construcción Vivienda Social Modelo NCh 1156"
              value={nombreProyecto}
              onChange={(e) => setNombreProyecto(e.target.value)}
              required
            />
            <Input
              label="Mandante (Cliente o Entidad)"
              placeholder="Ej: SERVIU / Municipalidad / Propietario"
              value={mandante}
              onChange={(e) => setMandante(e.target.value)}
              required
            />
            <Input
              label="Contratista (Empresa o Constructor)"
              placeholder="Ej: Constructora e Ingeniería Los Andes SpA"
              value={contratista}
              onChange={(e) => setContratista(e.target.value)}
              required
            />
            <Input
              label="Ubicación de la Obra"
              placeholder="Ej: Av. Las Acacias 1420, Maipú, RM"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              required
            />
            <Input
              type="date"
              label="Fecha de Emisión"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                step="0.5"
                min="0"
                max="100"
                label="G. Generales (%)"
                value={porcentajeGG}
                onChange={(e) => setPorcentajeGG(e.target.value)}
              />
              <Input
                type="number"
                step="0.5"
                min="0"
                max="100"
                label="Utilidades (%)"
                value={porcentajeUtil}
                onChange={(e) => setPorcentajeUtil(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tabla de Partidas e Ítems */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-amber-400">
                2. Itemizado por Partidas (Estructura Jerárquica NCh 1156)
              </h2>
              <p className="text-zinc-500 font-mono text-[11px] mt-0.5">
                Nivel 1: Títulos en negrita con subtotales • Nivel 2: Partidas técnicas con unidades oficiales y P.U.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="secondary" onClick={handleAddTitulo}>
                + Agregar Título (Nivel 1)
              </Button>
              <Button size="sm" variant="primary" onClick={() => handleAddPartida()}>
                + Agregar Partida (Nivel 2)
              </Button>
            </div>
          </div>

          {/* Tabla de Partidas */}
          <div className="overflow-x-auto border border-zinc-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-2 w-14 text-center">Ítem</th>
                  <th className="py-3 px-3 min-w-[240px]">Descripción Técnica</th>
                  <th className="py-3 px-2 w-28 text-center">Unidad</th>
                  <th className="py-3 px-2 w-28 text-right">Cantidad</th>
                  <th className="py-3 px-2 w-32 text-right">P. Unitario ($)</th>
                  <th className="py-3 px-3 w-36 text-right">Total ($)</th>
                  <th className="py-3 px-2 w-20 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-zinc-500">
                      Sin partidas ingresadas. Haga clic en "+ Agregar Título" o "+ Agregar Partida".
                    </td>
                  </tr>
                )}
                {items.map((it, idx) => {
                  const isTitulo = it.nivel === 1;
                  // Subtotal calculado para el título o total para partida
                  const itemProcesado = calculo.items[idx];
                  const totalCalculado = itemProcesado ? itemProcesado.total : 0;

                  return (
                    <tr
                      key={it.id || idx}
                      className={
                        isTitulo
                          ? 'bg-amber-500/10 font-bold border-t-2 border-amber-500/30'
                          : idx % 2 === 1
                          ? 'bg-zinc-900/60 hover:bg-zinc-800/40'
                          : 'bg-zinc-900 hover:bg-zinc-800/40'
                      }
                    >
                      {/* Código */}
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="text"
                          value={it.codigo || ''}
                          onChange={(e) => handleChangeItem(idx, 'codigo', e.target.value)}
                          className={`w-12 bg-transparent text-center focus:outline-none focus:bg-zinc-800 border-b border-dashed border-zinc-700 ${
                            isTitulo ? 'text-amber-400 font-black' : 'text-zinc-300'
                          }`}
                        />
                      </td>

                      {/* Descripción */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          {!isTitulo && <span className="text-zinc-600 pl-2">↳</span>}
                          <input
                            type="text"
                            value={it.descripcion || ''}
                            onChange={(e) => handleChangeItem(idx, 'descripcion', e.target.value)}
                            placeholder={isTitulo ? 'TÍTULO O CAPÍTULO' : 'Nombre técnico de la partida'}
                            className={`w-full bg-transparent focus:outline-none focus:bg-zinc-800 px-1.5 py-1 ${
                              isTitulo
                                ? 'text-amber-300 font-bold uppercase tracking-wider'
                                : 'text-zinc-100'
                            }`}
                          />
                        </div>
                      </td>

                      {/* Unidad */}
                      <td className="py-2.5 px-2 text-center">
                        {isTitulo ? (
                          <span className="text-zinc-600">-</span>
                        ) : (
                          <select
                            value={it.unidad || 'm2'}
                            onChange={(e) => handleChangeItem(idx, 'unidad', e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 text-zinc-200 px-2 py-1 text-xs font-mono focus:outline-none focus:border-amber-500 rounded-none w-full"
                          >
                            {UNIDADES_NCH1156.map((u) => (
                              <option key={u.value} value={u.value}>
                                {u.value}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* Cantidad (Cubicación) */}
                      <td className="py-2.5 px-2 text-right">
                        {isTitulo ? (
                          <span className="text-zinc-600">-</span>
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={it.cantidad ?? ''}
                            onChange={(e) => handleChangeItem(idx, 'cantidad', e.target.value)}
                            className="w-24 bg-zinc-800 border border-zinc-700 text-zinc-100 text-right px-2 py-1 focus:outline-none focus:border-amber-500"
                          />
                        )}
                      </td>

                      {/* P. Unitario ($ CLP) */}
                      <td className="py-2.5 px-2 text-right">
                        {isTitulo ? (
                          <span className="text-zinc-600">-</span>
                        ) : (
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={it.precio_unitario ?? ''}
                            onChange={(e) => handleChangeItem(idx, 'precio_unitario', e.target.value)}
                            className="w-28 bg-zinc-800 border border-zinc-700 text-zinc-100 text-right px-2 py-1 focus:outline-none focus:border-amber-500"
                          />
                        )}
                      </td>

                      {/* Total ($ CLP) */}
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-bold ${
                            isTitulo ? 'text-amber-400 text-sm' : 'text-zinc-200'
                          }`}
                        >
                          {formatCLP(totalCalculado)}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            title="Insertar partida debajo"
                            onClick={() => handleAddPartida(idx)}
                            className="text-zinc-400 hover:text-amber-400 p-1 text-xs"
                          >
                            ➕
                          </button>
                          <button
                            type="button"
                            title="Mover arriba"
                            disabled={idx === 0}
                            onClick={() => handleMove(idx, -1)}
                            className="text-zinc-500 hover:text-zinc-200 disabled:opacity-20 p-1"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            title="Mover abajo"
                            disabled={idx === items.length - 1}
                            onClick={() => handleMove(idx, 1)}
                            className="text-zinc-500 hover:text-zinc-200 disabled:opacity-20 p-1"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            title="Eliminar fila"
                            onClick={() => handleDeleteItem(idx)}
                            className="text-zinc-500 hover:text-red-400 p-1 font-bold text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumen Financiero y Validaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de Validaciones NCh 1156 */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 pb-2 border-b border-zinc-800">
              Validación Normativa NCh 1156 / MINVU
            </h3>

            {errores.length === 0 && advertencias.length === 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3">
                <p className="text-emerald-400 font-mono text-xs font-bold">
                  ✓ Estructura conforme a la Norma Chilena NCh 1156.
                </p>
                <p className="text-zinc-400 font-mono text-[11px] mt-1">
                  Todas las unidades corresponden a la nomenclatura oficial chilena y las jerarquías están correctamente establecidas.
                </p>
              </div>
            )}

            {errores.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 space-y-1">
                <p className="text-red-400 font-mono text-xs font-bold">
                  ⚠ Errores que impiden la emisión oficial ({errores.length}):
                </p>
                <ul className="text-red-300 font-mono text-[11px] space-y-1 list-disc list-inside">
                  {errores.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {advertencias.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 space-y-1">
                <p className="text-amber-400 font-mono text-xs font-bold">
                  ℹ Observaciones financieras:
                </p>
                <ul className="text-amber-300 font-mono text-[11px] space-y-1 list-disc list-inside">
                  {advertencias.map((adv, i) => (
                    <li key={i}>{adv}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 text-[11px] font-mono text-zinc-500 space-y-1">
              <p>• Unidades admitidas: <strong>m, m2, m3, un, gl, kg, lt</strong></p>
              <p>• Gastos Generales recomendados: <strong>8% a 15%</strong></p>
              <p>• Utilidades recomendadas: <strong>8% a 12%</strong></p>
              <p>• I.V.A.: <strong>19% estricto</strong> sobre Valor Neto</p>
            </div>
          </div>

          {/* Bloque Cierre Financiero (Pie de Presupuesto) */}
          <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 pb-2 border-b border-zinc-800">
              3. Cierre de Presupuesto (Pie Financiero NCh 1156)
            </h3>

            <dl className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center py-1">
                <dt className="text-zinc-400 uppercase tracking-wide">Costo Directo (CD):</dt>
                <dd className="text-white font-bold text-sm">{formatCLP(totales.costoDirecto)}</dd>
              </div>

              <div className="flex justify-between items-center py-1">
                <dt className="text-zinc-400 uppercase tracking-wide">
                  Gastos Generales ({totales.porcentajeGG}%):
                </dt>
                <dd className="text-zinc-200">{formatCLP(totales.gastosGenerales)}</dd>
              </div>

              <div className="flex justify-between items-center py-1">
                <dt className="text-zinc-400 uppercase tracking-wide">
                  Utilidades ({totales.porcentajeUtil}%):
                </dt>
                <dd className="text-zinc-200">{formatCLP(totales.utilidades)}</dd>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-zinc-800 font-bold">
                <dt className="text-zinc-300 uppercase tracking-wide">VALOR NETO:</dt>
                <dd className="text-amber-400 text-sm">{formatCLP(totales.valorNeto)}</dd>
              </div>

              <div className="flex justify-between items-center py-1">
                <dt className="text-zinc-400 uppercase tracking-wide">I.V.A. (19% estricto):</dt>
                <dd className="text-zinc-200">{formatCLP(totales.iva)}</dd>
              </div>

              <div className="flex justify-between items-center py-3 bg-zinc-950 px-3 border border-amber-500/30">
                <dt className="text-white font-black text-sm uppercase tracking-wider">
                  TOTAL PRESUPUESTO:
                </dt>
                <dd className="text-amber-400 font-black text-lg md:text-xl">
                  {formatCLP(totales.totalPresupuesto)}
                </dd>
              </div>
            </dl>

            <div className="pt-2 flex gap-3">
              <Button type="button" variant="primary" disabled={saving} onClick={handleSubmit} className="flex-1">
                {saving ? 'Guardando...' : '💾 Guardar y Emitir'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/presupuestos')}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
