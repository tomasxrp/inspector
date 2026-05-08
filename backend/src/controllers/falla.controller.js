import * as fallaService from '../services/falla.service.js';

export const crearFalla = async (req, res) => {
    try {
        const { id_revision, categoria_falla, nivel_gravedad, descripcion } = req.body;

        if (!id_revision || !categoria_falla || !nivel_gravedad || !descripcion) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const nuevaFalla = await fallaService.registrarFalla({
            id_revision: parseInt(id_revision, 10),
            categoria_falla,
            nivel_gravedad,
            descripcion
        });

        res.status(201).json({ mensaje: 'Falla registrada con éxito', falla: nuevaFalla });
    } catch (error) {
        if (error.message === 'REVISION_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La revisión asociada no existe' });
        }
        res.status(500).json({ error: 'Error al registrar la falla', detalle: error.message });
    }
};

export const obtenerFallasRevision = async (req, res) => {
    try {
        const id_revision = parseInt(req.params.id_revision, 10);
        const fallas = await fallaService.obtenerFallasPorRevision(id_revision);
        
        res.status(200).json(fallas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las fallas', detalle: error.message });
    }
};

export const obtenerFalla = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const falla = await fallaService.obtenerFallaPorId(id);
        
        res.status(200).json(falla);
    } catch (error) {
        if (error.message === 'FALLA_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La falla no existe' });
        }
        res.status(500).json({ error: 'Error al obtener la falla', detalle: error.message });
    }
};

export const actualizarFalla = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { categoria_falla, nivel_gravedad, descripcion } = req.body;

        const fallaActualizada = await fallaService.actualizarFalla(id, {
            categoria_falla,
            nivel_gravedad,
            descripcion
        });

        res.status(200).json({ mensaje: 'Falla actualizada', falla: fallaActualizada });
    } catch (error) {
        if (error.message === 'FALLA_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La falla no existe' });
        }
        res.status(500).json({ error: 'Error al actualizar la falla', detalle: error.message });
    }
};

export const eliminarFalla = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await fallaService.eliminarFalla(id);
        
        res.status(200).json({ mensaje: 'Falla eliminada con éxito' });
    } catch (error) {
        if (error.message === 'FALLA_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La falla no existe' });
        }
        res.status(500).json({ error: 'Error al eliminar la falla', detalle: error.message });
    }
};