import { Router } from 'express';
import * as usuarioController from '../controllers/usuario.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Ruta para crear un usuario: POST http://localhost:3000/api/usuarios
router.post('/registro', usuarioController.registrarUsuario);

// Ruta para obtener usuarios: GET http://localhost:3000/api/usuarios
router.get('/', usuarioController.obtenerUsuarios);

// Ruta para login: POST http://localhost:3000/api/usuarios/login
router.post('/login',usuarioController.login);

export default router;