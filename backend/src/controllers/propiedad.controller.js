import * as propiedadService from '../services/propiedad.service.js';

export const crearPropiedad = async (req, res) => {
    try {
        const id_usuario = req.usuario.id; // Viene del token JWT
        const { id_cliente, tipo_propiedad, direccion, comuna, info_adicional } = req.body;

        if (!id_cliente || !tipo_propiedad || !direccion || !comuna) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const nuevaPropiedad = await propiedadService.crearPropiedad({
            id_usuario,
            id_cliente: parseInt(id_cliente, 10),
            tipo_propiedad,
            direccion,
            comuna,
            info_adicional
        });

        res.status(201).json({ mensaje: 'Propiedad creada con éxito', propiedad: nuevaPropiedad });

    } catch (error) {
        if (error.message === 'USUARIO_NO_ENCONTRADO') {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        if (error.message === 'CLIENTE_NO_ENCONTRADO') {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para asociar una propiedad a un cliente que no te pertenece' });
        }
        res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
    }
};


export const obtenerPropiedades = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const propiedades = await propiedadService.obtenerPropiedades(id_usuario);
        res.status(200).json(propiedades);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las propiedades', detalle: error.message });
    }
};

export const obtenerPropiedadPorId = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const id_usuario = req.usuario.id;
        const propiedad = await propiedadService.obtenerPropiedadPorId(id, id_usuario);
        res.status(200).json(propiedad);
    } catch (error) {
        if (error.message === 'PROPIEDAD_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'Propiedad no encontrada' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para acceder a esta propiedad' });
        }
        res.status(500).json({ error: 'Error al obtener la propiedad', detalle: error.message });
    }
};

export const actualizarPropiedad = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const id_usuario = req.usuario.id;
        const { id_cliente, tipo_propiedad, direccion, comuna, info_adicional } = req.body;

        if (!id_cliente || !tipo_propiedad || !direccion || !comuna) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const propiedadActualizada = await propiedadService.actualizarPropiedad(id, id_usuario, {
            id_cliente: parseInt(id_cliente, 10),
            tipo_propiedad,
            direccion,
            comuna,
            info_adicional
        });

        res.status(200).json({ mensaje: 'Propiedad actualizada con éxito', propiedad: propiedadActualizada });
    } catch (error) {
        if (error.message === 'PROPIEDAD_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'Propiedad no encontrada' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para modificar esta propiedad' });
        }
        res.status(500).json({ error: 'Error al actualizar la propiedad', detalle: error.message });
    }
};

export const eliminarPropiedad = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const id_usuario = req.usuario.id;
        await propiedadService.eliminarPropiedad(id, id_usuario);
        res.status(200).json({ mensaje: 'Propiedad eliminada con éxito' });
    } catch (error) {
        if (error.message === 'PROPIEDAD_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'Propiedad no encontrada' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta propiedad' });
        }
        res.status(500).json({ error: 'Error al eliminar la propiedad', detalle: error.message });
    }
};