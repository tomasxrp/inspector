import * as revisionController from '../controllers/revision.controller.js';
import { Router } from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Ruta para crear una revisión: POST http://localhost:3000/api/revisiones
router.post('/', verificarToken, revisionController.crearRevision);

// Ruta para obtener revisiones por propiedad: GET http://localhost:3000/api/revisiones/propiedad/:id_propiedad
router.get('/propiedad/:id_propiedad', verificarToken, revisionController.obtenerRevisionesPropiedad);

// Ruta para obtener revisión por ID: GET http://localhost:3000/api/revisiones/:id_revision
router.get('/:id_revision', verificarToken, revisionController.obtenerRevisionPorId);

// Ruta para eliminar revisión por ID: DELETE http://localhost:3000/api/revisiones/:id_revision
router.delete('/:id_revision', verificarToken, revisionController.eliminarRevision);

// Ruta para actualizar revisión por ID: PUT http://localhost:3000/api/revisiones/:id_revision
router.put('/:id_revision', verificarToken, revisionController.actualizarRevision);

export default router;