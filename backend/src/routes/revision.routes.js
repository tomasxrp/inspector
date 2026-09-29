import * as revisionController from '../controllers/revision.controller.js';
import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Obtener todas las revisiones del usuario autenticado: GET /api/revisiones
router.get('/', verificarToken, revisionController.obtenerMisRevisiones);

// Crear una revisión: POST /api/revisiones
router.post('/', verificarToken, revisionController.crearRevision);

// Obtener revisiones de una propiedad del usuario: GET /api/revisiones/propiedad/:id_propiedad
router.get('/propiedad/:id_propiedad', verificarToken, revisionController.obtenerRevisionesPropiedad);

// Obtener revisión específica por ID: GET /api/revisiones/:id_revision
router.get('/:id_revision', verificarToken, revisionController.obtenerRevisionPorId);

// Eliminar revisión por ID: DELETE /api/revisiones/:id_revision
router.delete('/:id_revision', verificarToken, revisionController.eliminarRevision);

// Actualizar revisión por ID: PUT /api/revisiones/:id_revision
router.put('/:id_revision', verificarToken, revisionController.actualizarRevision);

export default router;