import { Router } from 'express';
import * as clienteController from '../controllers/cliente.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas RESTful limpias para Cliente
// La ruta base será /api/clientes (configurada en index.js)

// Crear un nuevo cliente
router.post('/', verificarToken, clienteController.crearCliente);

// Obtener todos los clientes
router.get('/', verificarToken, clienteController.obtenerClientes);

// Obtener un cliente específico por correo
router.get('/:correo', verificarToken, clienteController.obtenerClientePorCorreo);

// Actualizar un cliente por correo
router.put('/:correo', verificarToken, clienteController.actualizarCliente);

// Eliminar un cliente por correo
router.delete('/:correo', verificarToken, clienteController.eliminarCliente);

export default router;