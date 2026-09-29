import * as fallaService from '../services/falla.service.js';

export const crearFalla = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_revision, categoria_falla, nivel_gravedad, descripcion } = req.body;

        if (!id_revision || !categoria_falla || !nivel_gravedad || !descripcion) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const nuevaFalla = await fallaService.registrarFalla({
            id_revision: parseInt(id_revision, 10),
            categoria_falla,
            nivel_gravedad,
            descripcion
        }, id_usuario);

        res.status(201).json({ mensaje: 'Falla registrada con éxito', falla: nuevaFalla });
    } catch (error) {
        if (error.message === 'REVISION_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La revisión asociada no existe' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para registrar fallas en esta revisión' });
        }
        res.status(500).json({ error: 'Error al registrar la falla', detalle: error.message });
    }
};

export const obtenerFallasRevision = async (req, res) => {
    try {
        const id_revision = parseInt(req.params.id_revision, 10);
        const id_usuario = req.usuario.id;
        const fallas = await fallaService.obtenerFallasPorRevision(id_revision, id_usuario);
        
        res.status(200).json(fallas);
    } catch (error) {
        if (error.message === 'REVISION_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La revisión asociada no existe' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para ver las fallas de esta revisión' });
        }
        res.status(500).json({ error: 'Error al obtener las fallas', detalle: error.message });
    }
};

export const obtenerFalla = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const id_usuario = req.usuario.id;
        const falla = await fallaService.obtenerFallaPorId(id, id_usuario);
        
        res.status(200).json(falla);
    } catch (error) {
        if (error.message === 'FALLA_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La falla no existe' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para acceder a esta falla' });
        }
        res.status(500).json({ error: 'Error al obtener la falla', detalle: error.message });
    }
};

export const actualizarFalla = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const id_usuario = req.usuario.id;
        const { categoria_falla, nivel_gravedad, descripcion } = req.body;

        const fallaActualizada = await fallaService.actualizarFalla(id, id_usuario, {
            categoria_falla,
            nivel_gravedad,
            descripcion
        });

        res.status(200).json({ mensaje: 'Falla actualizada', falla: fallaActualizada });
    } catch (error) {
        if (error.message === 'FALLA_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La falla no existe' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para modificar esta falla' });
        }
        res.status(500).json({ error: 'Error al actualizar la falla', detalle: error.message });
    }
};

export const eliminarFalla = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const id_usuario = req.usuario.id;
        await fallaService.eliminarFalla(id, id_usuario);
        
        res.status(200).json({ mensaje: 'Falla eliminada con éxito' });
    } catch (error) {
        if (error.message === 'FALLA_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La falla no existe' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta falla' });
        }
        res.status(500).json({ error: 'Error al eliminar la falla', detalle: error.message });
    }
};