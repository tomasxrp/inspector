import * as clienteService from '../services/cliente.service.js';

export const crearCliente = async (req, res) => {
    try {
        const { nombre, apellido, correo, telefono} = req.body;

        if (!nombre || !apellido || !correo || !telefono) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const nuevoCliente = await clienteService.crearCliente({
            nombre,
            apellido,
            correo,
            telefono
        });
        
        res.status(201).json({ mensaje: 'Cliente creado con éxito', cliente: nuevoCliente });
    } catch (error) {
        if (error.message === 'CORREO_EXISTENTE') {
            return res.status(409).json({ error: 'El correo ya está registrado' });
        }
        res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
    }
}


export const obtenerClientes = async (req, res) => {
    try {
        const clientes = await clienteService.obtenerClientes();
        res.status(200).json(clientes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los clientes', detalle: error.message });
    }
}

export const obtenerClientePorCorreo = async (req, res) => {
    try {
        const { correo } = req.params;
        const cliente = await clienteService.obtenerClientePorCorreo(correo);
        res.status(200).json(cliente);
    } catch (error) {
        if (error.message === 'CLIENTE_NO_ENCONTRADO') {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.status(500).json({ error: 'Error al obtener el cliente', detalle: error.message });
    }
}

export const actualizarCliente = async (req, res) => {
    try {
        const { correo } = req.params;
        const { nombre, apellido, telefono } = req.body;

        if (!nombre || !apellido || !telefono) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const clienteActualizado = await clienteService.actualizarCliente(correo, {
            nombre,
            apellido,
            telefono
        });

        res.status(200).json({ mensaje: 'Cliente actualizado con éxito', cliente: clienteActualizado });
    } catch (error) {
        if (error.message === 'CLIENTE_NO_ENCONTRADO') {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.status(500).json({ error: 'Error al actualizar el cliente', detalle: error.message });
    }
}

export const eliminarCliente = async (req, res) => {
    try {
        const { correo } = req.params;
        await clienteService.eliminarCliente(correo);
        res.status(200).json({ mensaje: 'Cliente eliminado con éxito' });
    } catch (error) {
        if (error.message === 'CLIENTE_NO_ENCONTRADO') {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.status(500).json({ error: 'Error al eliminar el cliente', detalle: error.message });
    }
}