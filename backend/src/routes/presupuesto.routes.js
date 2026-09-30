import { Router } from 'express';
import * as presupuestoController from '../controllers/presupuesto.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Middleware opcional para permitir descarga directa o con token
const authOpcional = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (authHeader) {
    return verificarToken(req, res, next);
  }
  // Si no hay header, permitir con usuario por defecto
  req.usuario = { id: 1, correo: 'usuario@inspector.cl' };
  next();
};

// Plantillas oficiales predefinidas MINVU/MOP
router.get('/plantillas', authOpcional, presupuestoController.obtenerPlantillas);

// Motor de cálculo en vivo y validación NCh 1156 (sin guardar)
router.post('/calcular', authOpcional, presupuestoController.calcularItemizado);

// Generar PDF directo desde payload (útil para previsualización inmediata)
router.post('/pdf', authOpcional, presupuestoController.generarPdfPresupuesto);

// Listar presupuestos
router.get('/', authOpcional, presupuestoController.listarPresupuestos);

// Obtener por ID
router.get('/:id', authOpcional, presupuestoController.obtenerPresupuestoPorId);

// Descargar PDF por ID
router.get('/:id/pdf', authOpcional, presupuestoController.generarPdfPresupuesto);

// Crear presupuesto
router.post('/', authOpcional, presupuestoController.crearPresupuesto);

// Actualizar presupuesto
router.put('/:id', authOpcional, presupuestoController.actualizarPresupuesto);

// Eliminar presupuesto
router.delete('/:id', authOpcional, presupuestoController.eliminarPresupuesto);

export default router;
