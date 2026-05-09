import axios from 'axios';

// Instancia limpia SIN interceptores de auth — usada solo para login/registro
const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

export const loginService = (correo, contrasena) =>
  authApi.post('/usuarios/login', { correo, contrasena });

export const registrarService = (datos) =>
  authApi.post('/usuarios/registro', datos);