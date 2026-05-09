import api from '../../api/axios';

export const getClientes = () => api.get('/clientes');
export const getClientePorCorreo = (correo) => api.get(`/clientes/${correo}`);
export const crearCliente = (datos) => api.post('/clientes', datos);
export const actualizarCliente = (correo, datos) => api.put(`/clientes/${correo}`, datos);
export const eliminarCliente = (correo) => api.delete(`/clientes/${correo}`);