import api from '../../api/axios';

export const subirImagenFalla = (id_falla, file) => {
  const form = new FormData();
  form.append('imagen', file);
  return api.post(`/imagenes/falla/${id_falla}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};