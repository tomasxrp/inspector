import { Router } from 'express';
import multer from 'multer';
import * as imagenController from '../controllers/imagen.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Configurar multer para almacenar el archivo en memoria (Buffer)
const upload = multer({ storage: multer.memoryStorage() });

// Ruta para subir imagen: Se usa el middleware de Multer "upload.single('imagen')"
// 'imagen' es el nombre del campo que el Frontend debe usar al enviar el archivo
router.post('/falla/:id_falla', verificarToken, upload.single('imagen'), imagenController.subirImagenFalla);

export default router;