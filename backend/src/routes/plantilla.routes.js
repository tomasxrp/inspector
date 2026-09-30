import { Router } from 'express';
import * as plantillaController from '../controllers/plantilla.controller.js';

const router = Router();

router.get('/', plantillaController.getPlantillas);
router.get('/:id', plantillaController.getPlantilla);
router.post('/', plantillaController.createPlantilla);
router.put('/:id', plantillaController.updatePlantilla);
router.delete('/:id', plantillaController.deletePlantilla);

export default router;
