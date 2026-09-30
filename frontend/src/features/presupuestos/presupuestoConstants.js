/**
 * Constantes y Catálogos Oficiales bajo Norma Chilena NCh 1156
 * Estándares MINVU / MOP
 */

export const UNIDADES_NCH1156 = [
  { value: 'm', label: 'm (metro lineal)', descripcion: 'Tuberías, soleras, molduras, zócalos' },
  { value: 'm2', label: 'm2 (metro cuadrado)', descripcion: 'Superficies: radieres, muros, pinturas, techumbres' },
  { value: 'm3', label: 'm3 (metro cúbico)', descripcion: 'Volúmenes: excavaciones, hormigones, rellenos' },
  { value: 'un', label: 'un (unidad)', descripcion: 'Piezas: puertas, ventanas, artefactos sanitarios, tableros' },
  { value: 'gl', label: 'gl (global)', descripcion: 'Conjuntos: instalación faenas, trámites, aseo final' },
  { value: 'kg', label: 'kg (kilogramo)', descripcion: 'Pesos: acero de refuerzo A63-42H, perfiles de acero' },
  { value: 'lt', label: 'lt (litro)', descripcion: 'Líquidos: impermeabilizantes, selladores, pinturas líquidas' },
];

export const UNIDADES_VALIDAS_LIST = UNIDADES_NCH1156.map(u => u.value);

export const formatCLP = (valor) => {
  const num = Math.round(Number(valor) || 0);
  return '$ ' + new Intl.NumberFormat('es-CL').format(num);
};

export const formatCantidad = (valor) => {
  const num = Number(valor) || 0;
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export const PLANTILLAS_PREDEFINIDAS = [
  {
    id: 'minvu-vivienda-tipo',
    nombre: 'Vivienda Social Estándar MINVU / MOP',
    descripcion: 'Itemizado completo NCh 1156: Obras Previas, Obra Gruesa, Terminaciones e Instalaciones.',
    porcentaje_gg: 12.0,
    porcentaje_util: 10.0,
    items: [
      { nivel: 1, codigo: '1.0', descripcion: 'OBRAS PRELIMINARES Y FAENAS PROVISIONALES' },
      { nivel: 2, codigo: '1.1', descripcion: 'Limpieza, despeje y escarpe de terreno', unidad: 'm2', cantidad: 120.0, precio_unitario: 3500 },
      { nivel: 2, codigo: '1.2', descripcion: 'Instalación de faenas y bodega provisoria', unidad: 'gl', cantidad: 1.0, precio_unitario: 650000 },
      { nivel: 2, codigo: '1.3', descripcion: 'Cierro perimetral provisorio H=2.0m', unidad: 'm', cantidad: 45.0, precio_unitario: 14500 },
      { nivel: 2, codigo: '1.4', descripcion: 'Trazado, replanteo y niveles con niveleta', unidad: 'm2', cantidad: 75.0, precio_unitario: 4200 },

      { nivel: 1, codigo: '2.0', descripcion: 'OBRA GRUESA' },
      { nivel: 2, codigo: '2.1', descripcion: 'Excavación manual para cimientos', unidad: 'm3', cantidad: 28.5, precio_unitario: 18500 },
      { nivel: 2, codigo: '2.2', descripcion: 'Hormigón de emplantillado H-5', unidad: 'm3', cantidad: 3.8, precio_unitario: 85000 },
      { nivel: 2, codigo: '2.3', descripcion: 'Hormigón de cimientos H-20 (90) 20/40', unidad: 'm3', cantidad: 22.0, precio_unitario: 125000 },
      { nivel: 2, codigo: '2.4', descripcion: 'Moldajes de sobrecimiento', unidad: 'm2', cantidad: 42.0, precio_unitario: 16500 },
      { nivel: 2, codigo: '2.5', descripcion: 'Armadura de acero A63-42H fundaciones', unidad: 'kg', cantidad: 480.0, precio_unitario: 1950 },
      { nivel: 2, codigo: '2.6', descripcion: 'Hormigón sobrecimientos H-25', unidad: 'm3', cantidad: 8.5, precio_unitario: 135000 },
      { nivel: 2, codigo: '2.7', descripcion: 'Radier e=10cm con polietileno y malla C-92', unidad: 'm2', cantidad: 68.0, precio_unitario: 26500 },
      { nivel: 2, codigo: '2.8', descripcion: 'Muros de albañilería armada ladrillo fiscal', unidad: 'm2', cantidad: 115.0, precio_unitario: 38000 },
      { nivel: 2, codigo: '2.9', descripcion: 'Estructura techumbre cerchas pino tratado', unidad: 'm2', cantidad: 85.0, precio_unitario: 24500 },
      { nivel: 2, codigo: '2.10', descripcion: 'Cubierta plancha zinc-alum onda toledana', unidad: 'm2', cantidad: 92.0, precio_unitario: 18500 },

      { nivel: 1, codigo: '3.0', descripcion: 'TERMINACIONES' },
      { nivel: 2, codigo: '3.1', descripcion: 'Revoque y estuco exterior impermeable', unidad: 'm2', cantidad: 95.0, precio_unitario: 15500 },
      { nivel: 2, codigo: '3.2', descripcion: 'Enlucido de yeso interior muros y cielos', unidad: 'm2', cantidad: 180.0, precio_unitario: 12500 },
      { nivel: 2, codigo: '3.3', descripcion: 'Pavimento cerámico 45x45 esmaltado', unidad: 'm2', cantidad: 68.0, precio_unitario: 22000 },
      { nivel: 2, codigo: '3.4', descripcion: 'Pintura esmalte al agua en muros interiores', unidad: 'm2', cantidad: 210.0, precio_unitario: 6800 },
      { nivel: 2, codigo: '3.5', descripcion: 'Puertas de acceso e interiores completas', unidad: 'un', cantidad: 7.0, precio_unitario: 85000 },
      { nivel: 2, codigo: '3.6', descripcion: 'Ventanas de aluminio anodizado línea 5000', unidad: 'un', cantidad: 8.0, precio_unitario: 95000 },

      { nivel: 1, codigo: '4.0', descripcion: 'INSTALACIONES' },
      { nivel: 2, codigo: '4.1', descripcion: 'Red agua potable fría y caliente PPR', unidad: 'gl', cantidad: 1.0, precio_unitario: 1450000 },
      { nivel: 2, codigo: '4.2', descripcion: 'Red alcantarillado sanitario domiciliario', unidad: 'gl', cantidad: 1.0, precio_unitario: 1200000 },
      { nivel: 2, codigo: '4.3', descripcion: 'Red eléctrica monofásica con TDA y protecciones', unidad: 'gl', cantidad: 1.0, precio_unitario: 1650000 },
      { nivel: 2, codigo: '4.4', descripcion: 'Artefactos sanitarios (WC, lavamanos, tina)', unidad: 'un', cantidad: 3.0, precio_unitario: 165000 },
      { nivel: 2, codigo: '4.5', descripcion: 'Aseo general de entrega y retiro de escombros', unidad: 'gl', cantidad: 1.0, precio_unitario: 350000 },
    ],
  },
  {
    id: 'remodelacion-post-inspeccion',
    nombre: 'Reparaciones y Normalización Post-Inspección',
    descripcion: 'Itemizado de obras correctivas para subsanar observaciones de inspección.',
    porcentaje_gg: 10.0,
    porcentaje_util: 10.0,
    items: [
      { nivel: 1, codigo: '1.0', descripcion: 'TRABAJOS PREVIOS Y PROTECCIONES' },
      { nivel: 2, codigo: '1.1', descripcion: 'Protección de recintos interiores y retiro de elementos', unidad: 'gl', cantidad: 1.0, precio_unitario: 180000 },
      { nivel: 2, codigo: '1.2', descripcion: 'Picado y retiro de estucos soplados', unidad: 'm2', cantidad: 25.0, precio_unitario: 8500 },

      { nivel: 1, codigo: '2.0', descripcion: 'REPARACIONES ESTRUCTURALES Y ALBAÑILERÍA' },
      { nivel: 2, codigo: '2.1', descripcion: 'Sellado y engrapado de fisuras en muros con mortero epóxico', unidad: 'm', cantidad: 18.5, precio_unitario: 24500 },
      { nivel: 2, codigo: '2.2', descripcion: 'Reparación de radier agrietado y autonivelante', unidad: 'm2', cantidad: 22.0, precio_unitario: 19500 },

      { nivel: 1, codigo: '3.0', descripcion: 'IMPERMEABILIZACIONES Y TECHUMBRES' },
      { nivel: 2, codigo: '3.1', descripcion: 'Sellado de hojalatería, canaletas y bajadas de agua', unidad: 'm', cantidad: 32.0, precio_unitario: 12000 },
      { nivel: 2, codigo: '3.2', descripcion: 'Reemplazo de planchas de cubierta dañadas', unidad: 'm2', cantidad: 16.0, precio_unitario: 21500 },

      { nivel: 1, codigo: '4.0', descripcion: 'TERMINACIONES Y PINTURAS' },
      { nivel: 2, codigo: '4.1', descripcion: 'Empastado, sellado y pintura antihumedad en muros', unidad: 'm2', cantidad: 75.0, precio_unitario: 9500 },
      { nivel: 2, codigo: '4.2', descripcion: 'Ajuste y cepillado de puertas y ventanas descalzadas', unidad: 'un', cantidad: 6.0, precio_unitario: 35000 },
    ],
  },
];

/**
 * Motor de Cálculo NCh 1156 del lado del cliente
 */
export function calcularPresupuestoLocal(items = [], porcentajeGG = 10, porcentajeUtil = 10) {
  const ggPct = Math.max(0, Number(porcentajeGG) || 0);
  const utilPct = Math.max(0, Number(porcentajeUtil) || 0);

  let currentTitulo = null;
  let sumaCostoDirecto = 0;
  const itemsProcesados = [];
  const errores = [];
  const advertencias = [];

  if (ggPct < 8 || ggPct > 15) {
    advertencias.push(`Gastos Generales (${ggPct}%) fuera del rango típico recomendado (8% a 15%).`);
  }
  if (utilPct < 5 || utilPct > 15) {
    advertencias.push(`Utilidades (${utilPct}%) fuera del rango típico recomendado (8% a 12%).`);
  }

  for (let i = 0; i < items.length; i++) {
    const raw = items[i];
    const nivel = Number(raw.nivel) || 2;

    if (nivel === 1) {
      currentTitulo = {
        ...raw,
        nivel: 1,
        codigo: raw.codigo || `${itemsProcesados.filter(it => it.nivel === 1).length + 1}.0`,
        descripcion: raw.descripcion || '',
        unidad: '',
        cantidad: null,
        precio_unitario: null,
        total: 0,
        partidas: [],
      };
      if (!currentTitulo.descripcion.trim()) {
        errores.push(`El título ${currentTitulo.codigo} requiere una descripción.`);
      }
      itemsProcesados.push(currentTitulo);
    } else {
      const cantidad = parseFloat(raw.cantidad) || 0;
      const pu = Math.round(Number(raw.precio_unitario) || 0);
      const totalPartida = Math.round(cantidad * pu);
      const unidadNorm = (raw.unidad || '').trim().toLowerCase();

      if (!UNIDADES_VALIDAS_LIST.includes(unidadNorm)) {
        errores.push(`Partida ${raw.codigo || i + 1}: Unidad "${raw.unidad}" no es oficial NCh 1156.`);
      }
      if (cantidad <= 0) {
        errores.push(`Partida ${raw.codigo || i + 1}: La cantidad debe ser mayor a 0.`);
      }
      if (pu < 0) {
        errores.push(`Partida ${raw.codigo || i + 1}: El P.U. no puede ser negativo.`);
      }

      const partida = {
        ...raw,
        nivel: 2,
        codigo: raw.codigo || '',
        descripcion: raw.descripcion || '',
        unidad: unidadNorm,
        cantidad,
        precio_unitario: pu,
        total: totalPartida,
      };

      if (currentTitulo) {
        currentTitulo.total += totalPartida;
        currentTitulo.partidas.push(partida);
      }
      sumaCostoDirecto += totalPartida;
      itemsProcesados.push(partida);
    }
  }

  const costoDirecto = sumaCostoDirecto;
  const gastosGenerales = Math.round(costoDirecto * (ggPct / 100));
  const utilidades = Math.round(costoDirecto * (utilPct / 100));
  const valorNeto = costoDirecto + gastosGenerales + utilidades;
  const iva = Math.round(valorNeto * 0.19);
  const totalPresupuesto = valorNeto + iva;

  return {
    valido: errores.length === 0,
    errores,
    advertencias,
    items: itemsProcesados,
    totales: {
      costoDirecto,
      porcentajeGG: ggPct,
      gastosGenerales,
      porcentajeUtil: utilPct,
      utilidades,
      valorNeto,
      porcentajeIva: 19,
      iva,
      totalPresupuesto,
    },
  };
}
