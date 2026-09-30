import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { procesarItemizadoNCh1156 } from '../utils/nch1156.js';
import { PLANTILLAS_NCH1156 } from '../utils/plantillasNCh1156.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'presupuestos.json');

const prisma = new PrismaClient();

// Helper para archivo local de respaldo cuando Postgres no esté encendido
function initLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      // Sembrar con presupuesto de ejemplo oficial
      const template = PLANTILLAS_NCH1156[0];
      const procesado = procesarItemizadoNCh1156(template.items, template.porcentaje_gg, template.porcentaje_util);
      const inicial = [
        {
          id: 1,
          id_usuario: 1,
          nombre_proyecto: 'Construcción Vivienda Social Modelo NCh 1156',
          mandante: 'Servicio de Vivienda y Urbanización (SERVIU)',
          contratista: 'Constructora e Ingeniería Los Andes SpA',
          ubicacion: 'Av. Las Acacias 1420, Maipú, Región Metropolitana',
          fecha: new Date().toISOString(),
          porcentaje_gg: template.porcentaje_gg,
          porcentaje_util: template.porcentaje_util,
          items: procesado.items,
          totales: procesado.totales
        }
      ];
      fs.writeFileSync(DATA_FILE, JSON.stringify(inicial, null, 2), 'utf-8');
    }
  } catch (e) {
    console.error('Error inicializando almacenamiento local de presupuestos:', e.message);
  }
}

initLocalStore();

function readLocalPresupuestos() {
  try {
    initLocalStore();
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeLocalPresupuestos(presupuestos) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(presupuestos, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error guardando en archivo local:', e);
  }
}

export async function listarPresupuestos(id_usuario) {
  try {
    // Intentar base de datos Prisma
    const items = await prisma.presupuesto.findMany({
      where: { id_usuario },
      orderBy: { id: 'desc' }
    });
    if (items) return items;
  } catch (err) {
    // Fallback a almacenamiento local
  }

  const locales = readLocalPresupuestos();
  return locales.filter(p => !id_usuario || p.id_usuario === id_usuario || p.id_usuario === 1);
}

export async function obtenerPresupuestoPorId(id, id_usuario) {
  const numId = parseInt(id, 10);
  try {
    const item = await prisma.presupuesto.findFirst({
      where: { id: numId, id_usuario }
    });
    if (item) return item;
  } catch (err) {
    // Fallback
  }

  const locales = readLocalPresupuestos();
  const encontrado = locales.find(p => p.id === numId);
  if (!encontrado) {
    throw new Error('PRESUPUESTO_NO_ENCONTRADO');
  }
  return encontrado;
}

export async function crearPresupuesto(id_usuario, datos) {
  const {
    nombre_proyecto,
    mandante,
    contratista,
    ubicacion,
    fecha,
    porcentaje_gg = 10,
    porcentaje_util = 10,
    items = []
  } = datos;

  if (!nombre_proyecto || !mandante || !contratista || !ubicacion) {
    throw new Error('CAMPOS_REQUERIDOS_FALTANTES');
  }

  // Ejecutar motor de cálculo y validación NCh 1156
  const procesado = procesarItemizadoNCh1156(items, porcentaje_gg, porcentaje_util);
  if (!procesado.valido && procesado.errores.length > 0) {
    const errorMsg = procesado.errores.join(' | ');
    const err = new Error(errorMsg);
    err.detalleErrores = procesado.errores;
    throw err;
  }

  const fechaFinal = fecha ? new Date(fecha) : new Date();

  try {
    const nuevo = await prisma.presupuesto.create({
      data: {
        id_usuario,
        nombre_proyecto,
        mandante,
        contratista,
        ubicacion,
        fecha: fechaFinal,
        porcentaje_gg: Number(porcentaje_gg),
        porcentaje_util: Number(porcentaje_util),
        items: procesado.items,
        totales: procesado.totales
      }
    });
    return nuevo;
  } catch (err) {
    // Fallback a persistencia local
    const locales = readLocalPresupuestos();
    const nextId = locales.length > 0 ? Math.max(...locales.map(p => p.id)) + 1 : 1;
    const nuevoLocal = {
      id: nextId,
      id_usuario: id_usuario || 1,
      nombre_proyecto,
      mandante,
      contratista,
      ubicacion,
      fecha: fechaFinal.toISOString(),
      porcentaje_gg: Number(porcentaje_gg),
      porcentaje_util: Number(porcentaje_util),
      items: procesado.items,
      totales: procesado.totales,
      advertencias: procesado.advertencias
    };
    locales.unshift(nuevoLocal);
    writeLocalPresupuestos(locales);
    return nuevoLocal;
  }
}

export async function actualizarPresupuesto(id, id_usuario, datos) {
  const numId = parseInt(id, 10);
  const {
    nombre_proyecto,
    mandante,
    contratista,
    ubicacion,
    fecha,
    porcentaje_gg = 10,
    porcentaje_util = 10,
    items = []
  } = datos;

  const procesado = procesarItemizadoNCh1156(items, porcentaje_gg, porcentaje_util);
  if (!procesado.valido && procesado.errores.length > 0) {
    const err = new Error(procesado.errores.join(' | '));
    err.detalleErrores = procesado.errores;
    throw err;
  }

  const fechaFinal = fecha ? new Date(fecha) : new Date();

  try {
    const actualizado = await prisma.presupuesto.update({
      where: { id: numId },
      data: {
        nombre_proyecto,
        mandante,
        contratista,
        ubicacion,
        fecha: fechaFinal,
        porcentaje_gg: Number(porcentaje_gg),
        porcentaje_util: Number(porcentaje_util),
        items: procesado.items,
        totales: procesado.totales
      }
    });
    return actualizado;
  } catch (err) {
    const locales = readLocalPresupuestos();
    const index = locales.findIndex(p => p.id === numId);
    if (index === -1) {
      throw new Error('PRESUPUESTO_NO_ENCONTRADO');
    }
    locales[index] = {
      ...locales[index],
      nombre_proyecto: nombre_proyecto ?? locales[index].nombre_proyecto,
      mandante: mandante ?? locales[index].mandante,
      contratista: contratista ?? locales[index].contratista,
      ubicacion: ubicacion ?? locales[index].ubicacion,
      fecha: fechaFinal.toISOString(),
      porcentaje_gg: Number(porcentaje_gg),
      porcentaje_util: Number(porcentaje_util),
      items: procesado.items,
      totales: procesado.totales,
      advertencias: procesado.advertencias
    };
    writeLocalPresupuestos(locales);
    return locales[index];
  }
}

export async function eliminarPresupuesto(id, id_usuario) {
  const numId = parseInt(id, 10);
  try {
    await prisma.presupuesto.delete({
      where: { id: numId }
    });
    return true;
  } catch (err) {
    const locales = readLocalPresupuestos();
    const filtrados = locales.filter(p => p.id !== numId);
    writeLocalPresupuestos(filtrados);
    return true;
  }
}

export function obtenerPlantillas() {
  return PLANTILLAS_NCH1156;
}
