import api from '../../api/axios';
import { PLANTILLAS_PREDEFINIDAS, calcularPresupuestoLocal } from './presupuestoConstants';

const STORAGE_KEY = 'inspector_presupuestos_cache_v1';

function getStoredPresupuestos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading localStorage presupuestos:', e);
  }

  // Si no hay datos, inicializamos con la plantilla oficial
  const defaultTemplate = PLANTILLAS_PREDEFINIDAS[0];
  const calculo = calcularPresupuestoLocal(defaultTemplate.items, defaultTemplate.porcentaje_gg, defaultTemplate.porcentaje_util);
  const initial = [
    {
      id: 1,
      nombre_proyecto: 'Construcción Vivienda Social Modelo NCh 1156',
      mandante: 'Servicio de Vivienda y Urbanización (SERVIU)',
      contratista: 'Constructora e Ingeniería Los Andes SpA',
      ubicacion: 'Av. Las Acacias 1420, Maipú, Región Metropolitana',
      fecha: new Date().toISOString(),
      porcentaje_gg: defaultTemplate.porcentaje_gg,
      porcentaje_util: defaultTemplate.porcentaje_util,
      items: calculo.items,
      totales: calculo.totales,
    },
  ];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch {
    // Ignore
  }
  return initial;
}

function saveStoredPresupuestos(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

export const getPresupuestos = async () => {
  try {
    const res = await api.get('/presupuestos');
    if (Array.isArray(res.data) && res.data.length > 0) {
      saveStoredPresupuestos(res.data);
      return res.data;
    }
  } catch (err) {
    console.warn('Backend presupuestos no disponible, usando almacenamiento local:', err.message);
  }
  return getStoredPresupuestos();
};

export const getPresupuestoPorId = async (id) => {
  const numId = parseInt(id, 10);
  try {
    const res = await api.get(`/presupuestos/${id}`);
    if (res.data) return res.data;
  } catch (err) {
    console.warn('Backend presupuesto por id no disponible, buscando en cache:', err.message);
  }

  const list = getStoredPresupuestos();
  const item = list.find((p) => p.id === numId);
  if (!item) {
    throw new Error('Presupuesto no encontrado');
  }
  return item;
};

export const crearPresupuesto = async (datos) => {
  const calculo = calcularPresupuestoLocal(datos.items, datos.porcentaje_gg, datos.porcentaje_util);
  const payload = {
    ...datos,
    items: calculo.items,
    totales: calculo.totales,
  };

  try {
    const res = await api.post('/presupuestos', payload);
    if (res.data?.presupuesto) {
      const list = getStoredPresupuestos();
      list.unshift(res.data.presupuesto);
      saveStoredPresupuestos(list);
      return res.data.presupuesto;
    }
  } catch (err) {
    console.warn('Error al guardar en backend, persistiendo localmente:', err.message);
  }

  // Fallback local
  const list = getStoredPresupuestos();
  const nextId = list.length > 0 ? Math.max(...list.map((p) => p.id || 0)) + 1 : 1;
  const nuevo = {
    id: nextId,
    ...payload,
    fecha: datos.fecha || new Date().toISOString(),
  };
  list.unshift(nuevo);
  saveStoredPresupuestos(list);
  return nuevo;
};

export const actualizarPresupuesto = async (id, datos) => {
  const numId = parseInt(id, 10);
  const calculo = calcularPresupuestoLocal(datos.items, datos.porcentaje_gg, datos.porcentaje_util);
  const payload = {
    ...datos,
    items: calculo.items,
    totales: calculo.totales,
  };

  try {
    const res = await api.put(`/presupuestos/${id}`, payload);
    if (res.data?.presupuesto) {
      const list = getStoredPresupuestos();
      const idx = list.findIndex((p) => p.id === numId);
      if (idx !== -1) list[idx] = res.data.presupuesto;
      saveStoredPresupuestos(list);
      return res.data.presupuesto;
    }
  } catch (err) {
    console.warn('Error al actualizar en backend, actualizando localmente:', err.message);
  }

  const list = getStoredPresupuestos();
  const idx = list.findIndex((p) => p.id === numId);
  if (idx === -1) throw new Error('Presupuesto no encontrado');
  list[idx] = { ...list[idx], ...payload, id: numId };
  saveStoredPresupuestos(list);
  return list[idx];
};

export const eliminarPresupuesto = async (id) => {
  const numId = parseInt(id, 10);
  try {
    await api.delete(`/presupuestos/${id}`);
  } catch (err) {
    console.warn('Backend delete falló, eliminando localmente:', err.message);
  }

  const list = getStoredPresupuestos();
  const filtrados = list.filter((p) => p.id !== numId);
  saveStoredPresupuestos(filtrados);
  return true;
};

export const descargarPdfPresupuesto = async (presupuesto) => {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
  const rawAuth = localStorage.getItem('auth');
  const token = rawAuth ? JSON.parse(rawAuth).token : null;
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  if (presupuesto.id) {
    // Descarga por ID
    try {
      res = await fetch(`${base}/presupuestos/${presupuesto.id}/pdf`, { headers });
    } catch {
      // Fallback a POST
    }
  }

  if (!res || !res.ok) {
    // Si falla el endpoint GET por ID, enviar el payload al endpoint POST /pdf
    res = await fetch(`${base}/presupuestos/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(presupuesto),
    });
  }

  if (!res.ok) {
    throw new Error('No se pudo generar el archivo PDF en el servidor.');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Itemizado-NCh1156-${String(presupuesto.id || 'Oficial').padStart(4, '0')}.pdf`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
};

export const getPlantillas = async () => {
  try {
    const res = await api.get('/plantillas');
    return res.data;
  } catch (err) {
    console.warn('Backend plantillas no disponible', err.message);
    return PLANTILLAS_PREDEFINIDAS;
  }
};

export const crearPlantilla = async (datos) => {
  try {
    const res = await api.post('/plantillas', datos);
    return res.data;
  } catch (err) {
    throw new Error('Error al crear plantilla: ' + err.message);
  }
};
