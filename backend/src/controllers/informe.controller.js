import * as informeService from '../services/informe.service.js';

export const crearInforme = async (req, res) => {
    try {
        const { id_revision, veredicto_final, observaciones_cliente, url_pdf } = req.body;

        if (!id_revision || !veredicto_final || !observaciones_cliente) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const nuevoInforme = await informeService.crearInforme(parseInt(id_revision, 10), {
            veredicto_final,
            observaciones_cliente,
            url_pdf
        });

        res.status(201).json({ mensaje: 'Informe generado con éxito', informe: nuevoInforme });
    } catch (error) {
        if (error.message === 'REVISION_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La revisión asociada no existe' });
        }
        if (error.message === 'INFORME_YA_EXISTE') {
            return res.status(409).json({ error: 'Esta revisión ya tiene un informe oficial emitido' });
        }
        res.status(500).json({ error: 'Error al crear el informe', detalle: error.message });
    }
};

export const obtenerInformePorRevision = async (req, res) => {
    try {
        const id_revision = parseInt(req.params.id_revision, 10);
        const informe = await informeService.obtenerInformeCompleto(id_revision);
        
        res.status(200).json(informe);
    } catch (error) {
        if (error.message === 'INFORME_NO_ENCONTRADO') {
            return res.status(404).json({ error: 'No se encontró un informe para esta revisión' });
        }
        res.status(500).json({ error: 'Error al obtener el informe', detalle: error.message });
    }
};

export const actualizarInforme = async (req, res) => {
    try {
        const id_revision = parseInt(req.params.id_revision, 10);
        const { veredicto_final, observaciones_cliente, url_pdf } = req.body;

        const informeActualizado = await informeService.actualizarInforme(id_revision, {
            veredicto_final,
            observaciones_cliente,
            url_pdf
        });

        res.status(200).json({ mensaje: 'Informe actualizado', informe: informeActualizado });
    } catch (error) {
        if (error.message === 'INFORME_NO_ENCONTRADO') {
            return res.status(404).json({ error: 'El informe no existe' });
        }
        res.status(500).json({ error: 'Error al actualizar el informe', detalle: error.message });
    }
};