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
            id_cliente,
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
        res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
    }
}


export const obtenerPropiedades = async (req, res) => {
    try {
        const propiedades = await propiedadService.obtenerPropiedades();
        res.status(200).json(propiedades);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las propiedades', detalle: error.message });
    }
}

export const obtenerPropiedadPorId = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const propiedad = await propiedadService.obtenerPropiedadPorId(id);
        res.status(200).json(propiedad);
    } catch (error) {
        if (error.message === 'PROPIEDAD_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'Propiedad no encontrada' });
        }
        res.status(500).json({ error: 'Error al obtener la propiedad', detalle: error.message });
    }
}

export const actualizarPropiedad = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const id_usuario = req.usuario.id; // Del token JWT
        const { id_cliente, tipo_propiedad, direccion, comuna, info_adicional } = req.body;

        if (!id_cliente || !tipo_propiedad || !direccion || !comuna) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const propiedadActualizada = await propiedadService.actualizarPropiedad(id, {
            id_usuario,
            id_cliente,
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
        res.status(500).json({ error: 'Error al actualizar la propiedad', detalle: error.message });
    }
}

export const eliminarPropiedad = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await propiedadService.eliminarPropiedad(id);
        res.status(200).json({ mensaje: 'Propiedad eliminada con éxito' });
    } catch (error) {
        if (error.message === 'PROPIEDAD_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'Propiedad no encontrada' });
        }
        res.status(500).json({ error: 'Error al eliminar la propiedad', detalle: error.message });
    }
}