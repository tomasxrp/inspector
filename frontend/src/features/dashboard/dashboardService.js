import api from '../../api/axios';

export const getEstadisticas = () => {
  return api.get('/dashboard/stats');
};
