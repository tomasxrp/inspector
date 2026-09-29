import * as revisionService from '../services/revision.service.js';

export const crearRevision = async (req, res) => {
    try {
        const id_usuario = req.usuario.id; 
        const { id_propiedad, categoria_observacion, descripcion_general } = req.body;

        if (!id_propiedad || !categoria_observacion) {
            return res.status(400).json({ error: 'Faltan campos obligatorios (id_propiedad, categoria_observacion)' });
        }

        const nuevaRevision = await revisionService.crearRevision({
            id_propiedad: parseInt(id_propiedad, 10),
            id_usuario,
            categoria_observacion,
            descripcion_general
        });

        res.status(201).json({ mensaje: 'Revisión iniciada con éxito', revision: nuevaRevision });
    } catch (error) {
        if (error.message === 'PROPIEDAD_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La propiedad especificada no existe' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para registrar revisiones en esta propiedad' });
        }
        res.status(500).json({ error: 'Error al crear la revisión', detalle: error.message });
    }
};

export const obtenerMisRevisiones = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const revisiones = await revisionService.obtenerMisRevisiones(id_usuario);
        res.status(200).json(revisiones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener tus revisiones', detalle: error.message });
    }
};

export const obtenerRevisionesPropiedad = async (req, res) => {
    try {
        const id_propiedad = parseInt(req.params.id_propiedad, 10);
        const id_usuario = req.usuario.id;
        const revisiones = await revisionService.obtenerRevisionesPorPropiedad(id_propiedad, id_usuario);
        res.status(200).json(revisiones);
    } catch (error) {
        if (error.message === 'PROPIEDAD_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La propiedad especificada no existe' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para acceder a las revisiones de esta propiedad' });
        }
        res.status(500).json({ error: 'Error al obtener revisiones', detalle: error.message });
    }
};

export const obtenerRevisionPorId = async (req, res) => {
    try {
        const id_revision = parseInt(req.params.id_revision, 10);
        const id_usuario = req.usuario.id;
        const revision = await revisionService.obtenerRevisionPorId(id_revision, id_usuario);
        res.status(200).json(revision);
    } catch (error) {
        if (error.message === 'REVISION_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La revisión especificada no existe' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para acceder a esta revisión' });
        }
        res.status(500).json({ error: 'Error al obtener la revisión', detalle: error.message });
    }
};

export const eliminarRevision = async (req, res) => {
    try {
        const id_revision = parseInt(req.params.id_revision, 10);
        const id_usuario = req.usuario.id;
        await revisionService.eliminarRevision(id_revision, id_usuario);
        res.status(200).json({ mensaje: 'Revisión eliminada con éxito' });
    } catch (error) {
        if (error.message === 'REVISION_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La revisión especificada no existe' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta revisión' });
        }
        res.status(500).json({ error: 'Error al eliminar la revisión', detalle: error.message });
    }
};

export const actualizarRevision = async (req, res) => {
    try {
        const id = parseInt(req.params.id_revision, 10);
        const id_usuario = req.usuario.id;
        const { categoria_observacion, descripcion_general } = req.body;

        const revisionActualizada = await revisionService.actualizarRevision(id, id_usuario, {
            categoria_observacion,
            descripcion_general
        });

        res.status(200).json({ mensaje: 'Revisión actualizada con éxito', revision: revisionActualizada });
    } catch (error) {
        if (error.message === 'REVISION_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La revisión no existe' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para modificar esta revisión' });
        }
        res.status(500).json({ error: 'Error al actualizar la revisión', detalle: error.message });
    }
};