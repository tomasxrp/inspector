import { Router } from 'express';
import * as informeController from '../controllers/informe.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Crear informe
router.post('/', verificarToken, informeController.crearInforme);

// Obtener informe completo por ID de revisión
router.get('/revision/:id_revision', verificarToken, informeController.obtenerInformePorRevision);

// Actualizar informe por ID de revisión (ej. para inyectar el url_pdf cuando se genere)
router.put('/revision/:id_revision', verificarToken, informeController.actualizarInforme);

export default router;