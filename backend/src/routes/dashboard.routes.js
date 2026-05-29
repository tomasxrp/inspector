import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Ruta para obtener estadísticas: GET /api/dashboard/stats
router.get('/stats', verificarToken, dashboardController.obtenerEstadisticas);

export default router;
