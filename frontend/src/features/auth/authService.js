import api from '../../api/axios';

export const loginService = (correo, contrasena) =>
  api.post('/usuarios/login', { correo, contrasena });

export const registrarService = (datos) =>
  api.post('/usuarios/registro', datos);