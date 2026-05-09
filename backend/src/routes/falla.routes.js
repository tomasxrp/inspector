import { Router } from 'express';
import * as fallaController from '../controllers/falla.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Crear una nueva falla
router.post('/', verificarToken, fallaController.crearFalla);

// Obtener todas las fallas de una revisión en particular
router.get('/revision/:id_revision', verificarToken, fallaController.obtenerFallasRevision);

// Operaciones sobre una falla específica por su propio ID
router.get('/:id', verificarToken, fallaController.obtenerFalla);
router.put('/:id', verificarToken, fallaController.actualizarFalla);
router.delete('/:id', verificarToken, fallaController.eliminarFalla);

export default router;