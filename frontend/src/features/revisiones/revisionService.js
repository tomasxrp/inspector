import api from '../../api/axios';

export const getRevisionesPorPropiedad = (id_propiedad) =>
  api.get(`/revisiones/propiedad/${id_propiedad}`);

export const getRevisionPorId = (id) => api.get(`/revisiones/${id}`);
export const crearRevision = (datos) => api.post('/revisiones', datos);
export const actualizarRevision = (id, datos) => api.put(`/revisiones/${id}`, datos);
export const eliminarRevision = (id) => api.delete(`/revisiones/${id}`);