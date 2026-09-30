/**
 * Utilidades y Motor de Cálculo según Norma Chilena NCh 1156
 * "Construcción - Especificaciones técnicas - Ordenación y designación de partidas"
 * Estándares MINVU / MOP
 */

export const UNIDADES_VALIDAS_NCH1156 = ['m', 'm2', 'm3', 'un', 'gl', 'kg', 'lt'];

export const UNIDADES_DETALLE = {
  m: 'Metro lineal (soleras, tuberías, molduras)',
  m2: 'Metro cuadrado (radieres, muros, enlucidos, pisos, techos)',
  m3: 'Metro cúbico (excavaciones, hormigones, rellenos)',
  un: 'Unidad (artefactos, puertas, ventanas, tableros)',
  gl: 'Global (faenas provisorias, permisos, aseo final)',
  kg: 'Kilogramo (acero de refuerzo A63-42H, perfiles metálicos)',
  lt: 'Litro (impermeabilizantes, pinturas, aditivos)'
};

/**
 * Formatear un valor numérico a Pesos Chilenos (CLP) sin decimales.
 * Ej: 15420000 -> "$ 15.420.000"
 */
export function formatCLP(valor) {
  const num = Math.round(Number(valor) || 0);
  return '$ ' + new Intl.NumberFormat('es-CL').format(num);
}

/**
 * Formatear una cantidad a formato chileno con hasta 2 decimales.
 * Ej: 24.5 -> "24,5"
 */
export function formatCantidad(valor) {
  const num = Number(valor) || 0;
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Valida y calcula una estructura de itemizado NCh 1156
 * @param {Array} items Lista de títulos y partidas
 * @param {number} porcentajeGG Porcentaje de Gastos Generales (ej. 10)
 * @param {number} porcentajeUtil Porcentaje de Utilidades (ej. 10)
 */
export function procesarItemizadoNCh1156(items = [], porcentajeGG = 10, porcentajeUtil = 10) {
  const errores = [];
  const advertencias = [];

  const ggPct = Number(porcentajeGG) >= 0 ? Number(porcentajeGG) : 10;
  const utilPct = Number(porcentajeUtil) >= 0 ? Number(porcentajeUtil) : 10;

  if (ggPct < 8 || ggPct > 15) {
    advertencias.push(`Gastos Generales (${ggPct}%) fuera del rango típico recomendado (8% - 15%).`);
  }
  if (utilPct < 5 || utilPct > 15) {
    advertencias.push(`Utilidades (${utilPct}%) fuera del rango típico recomendado (8% - 12%).`);
  }

  const itemsProcesados = [];
  let currentTitulo = null;
  let sumaCostoDirecto = 0;

  for (let i = 0; i < items.length; i++) {
    const raw = items[i];
    const nivel = Number(raw.nivel) || (raw.codigo && raw.codigo.includes('.') && raw.codigo.split('.')[1] === '0' ? 1 : 2);

    if (nivel === 1) {
      // Nivel 1: Título / Capítulo (ej: 1.0 Obras Previas)
      currentTitulo = {
        id: raw.id || `tit-${i + 1}`,
        nivel: 1,
        codigo: raw.codigo ? raw.codigo.trim() : `${itemsProcesados.filter(it => it.nivel === 1).length + 1}.0`,
        descripcion: (raw.descripcion || '').trim(),
        unidad: '',
        cantidad: null,
        precio_unitario: null,
        total: 0,
        partidas: []
      };

      if (!currentTitulo.descripcion) {
        errores.push(`El título Nivel 1 [${currentTitulo.codigo}] debe tener una descripción.`);
      }

      itemsProcesados.push(currentTitulo);
    } else {
      // Nivel 2: Partida (ej: 1.1 Trazado y Niveles)
      const unidadNorm = (raw.unidad || '').trim().toLowerCase();
      if (!UNIDADES_VALIDAS_NCH1156.includes(unidadNorm)) {
        errores.push(`Partida ${raw.codigo || i + 1}: La unidad '${raw.unidad}' no es válida según NCh 1156. Permitidas: ${UNIDADES_VALIDAS_NCH1156.join(', ')}.`);
      }

      const cantidad = parseFloat(raw.cantidad);
      if (isNaN(cantidad) || cantidad <= 0) {
        errores.push(`Partida ${raw.codigo || i + 1}: La cantidad debe ser un valor numérico mayor a 0.`);
      }

      const pu = Math.round(Number(raw.precio_unitario));
      if (isNaN(pu) || pu < 0) {
        errores.push(`Partida ${raw.codigo || i + 1}: El Precio Unitario (P.U.) debe ser un número entero en CLP mayor o igual a 0.`);
      }

      const totalPartida = Math.round((cantidad || 0) * (pu || 0));

      const partidaProcesada = {
        id: raw.id || `par-${i + 1}`,
        nivel: 2,
        codigo: (raw.codigo || '').trim(),
        descripcion: (raw.descripcion || '').trim(),
        unidad: unidadNorm,
        cantidad: Number((cantidad || 0).toFixed(2)),
        precio_unitario: pu || 0,
        total: totalPartida
      };

      if (!partidaProcesada.descripcion) {
        errores.push(`Partida ${partidaProcesada.codigo || i + 1}: Debe tener un nombre técnico.`);
      }

      // Sumar al título padre si existe
      if (currentTitulo) {
        currentTitulo.total += totalPartida;
        currentTitulo.partidas.push(partidaProcesada);
      }

      sumaCostoDirecto += totalPartida;
      itemsProcesados.push(partidaProcesada);
    }
  }

  // Cálculos de Cierre Financiero (Obligatorio en este orden):
  // 1. Costo Directo (CD)
  const costoDirecto = sumaCostoDirecto;
  // 2. Gastos Generales (GG)
  const gastosGenerales = Math.round(costoDirecto * (ggPct / 100));
  // 3. Utilidades
  const utilidades = Math.round(costoDirecto * (utilPct / 100));
  // 4. Valor Neto
  const valorNeto = costoDirecto + gastosGenerales + utilidades;
  // 5. I.V.A. (19% estricto)
  const iva = Math.round(valorNeto * 0.19);
  // 6. Total Presupuesto
  const totalPresupuesto = valorNeto + iva;

  const totales = {
    costoDirecto,
    porcentajeGG: ggPct,
    gastosGenerales,
    porcentajeUtil: utilPct,
    utilidades,
    valorNeto,
    porcentajeIva: 19,
    iva,
    totalPresupuesto
  };

  return {
    valido: errores.length === 0,
    errores,
    advertencias,
    items: itemsProcesados,
    totales
  };
}
