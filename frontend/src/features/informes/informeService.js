import api from '../../api/axios';

export const getInformePorRevision = (id_revision) =>
  api.get(`/informes/revision/${id_revision}`);

export const crearInforme = (datos) => api.post('/informes', datos);
export const actualizarInforme = (id_revision, datos) =>
  api.put(`/informes/revision/${id_revision}`, datos);