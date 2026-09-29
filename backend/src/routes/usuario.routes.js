import { Router } from 'express';
import * as usuarioController from '../controllers/usuario.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Registro de usuario: POST /api/usuarios/registro
router.post('/registro', usuarioController.registrarUsuario);

// Login de usuario: POST /api/usuarios/login
router.post('/login', usuarioController.login);

// Perfil del usuario autenticado: GET /api/usuarios/perfil
router.get('/perfil', verificarToken, usuarioController.obtenerPerfil);

export default router;