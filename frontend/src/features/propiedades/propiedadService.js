import api from '../../api/axios';

export const getPropiedades = () => api.get('/propiedades');
export const getPropiedadPorId = (id) => api.get(`/propiedades/${id}`);
export const crearPropiedad = (datos) => api.post('/propiedades', datos);
export const actualizarPropiedad = (id, datos) => api.put(`/propiedades/${id}`, datos);
export const eliminarPropiedad = (id) => api.delete(`/propiedades/${id}`);