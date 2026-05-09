import api from '../../api/axios';

export const getFallasPorRevision = (id_revision) =>
  api.get(`/fallas/revision/${id_revision}`);

export const crearFalla = (datos) => api.post('/fallas', datos);
export const actualizarFalla = (id, datos) => api.put(`/fallas/${id}`, datos);
export const eliminarFalla = (id) => api.delete(`/fallas/${id}`);