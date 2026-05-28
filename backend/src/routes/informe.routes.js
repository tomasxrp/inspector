import { Router } from 'express';
import * as informeController from '../controllers/informe.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verificarToken, informeController.crearInforme);
router.get('/revision/:id_revision', verificarToken, informeController.obtenerInformePorRevision);
router.put('/revision/:id_revision', verificarToken, informeController.actualizarInforme);
// NEW: download PDF
router.get('/revision/:id_revision/pdf', verificarToken, informeController.generarPdfInforme);

export default router;