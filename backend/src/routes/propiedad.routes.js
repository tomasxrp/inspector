import { Router } from 'express';
import * as propiedadController from '../controllers/propiedad.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas RESTful limpias (el método HTTP ya indica la acción)
router.post('/', verificarToken, propiedadController.crearPropiedad);
router.get('/', verificarToken, propiedadController.obtenerPropiedades);
router.get('/:id', verificarToken, propiedadController.obtenerPropiedadPorId);
router.put('/:id', verificarToken, propiedadController.actualizarPropiedad);
router.delete('/:id', verificarToken, propiedadController.eliminarPropiedad);

export default router;