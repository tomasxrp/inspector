import { supabase } from '../config/supabase.config.js';
import * as imagenService from '../services/imagen.service.js';

export const subirImagenFalla = async (req, res) => {
    try {
        const id_falla = parseInt(req.params.id_falla, 10);
        const id_usuario = req.usuario.id;
        const archivo  = req.file;

        if (!archivo) {
            return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
        }

        if (!archivo.buffer || archivo.buffer.length === 0) {
            return res.status(400).json({ error: 'El archivo recibido está vacío' });
        }

        // Map MIME type → safe extension (never trust the original filename)
        const mimeToExt = {
            'image/jpeg':    'jpg',
            'image/jpg':     'jpg',
            'image/png':     'png',
            'image/webp':    'webp',
            'image/gif':     'gif',
            'image/heic':    'heic',
            'image/heif':    'heif',
        };
        const ext          = mimeToExt[archivo.mimetype] ?? 'jpg';
        const nombreArchivo = `falla-${id_falla}-${Date.now()}.${ext}`;

        const { data, error } = await supabase.storage
            .from('imagenes_fallas')
            .upload(nombreArchivo, archivo.buffer, {
                contentType: archivo.mimetype,
                upsert: false,
            });

        if (error) {
            console.error('[imagen] Supabase error:', error);
            return res.status(500).json({
                error:  'Error al subir imagen a almacenamiento',
                detalle: error.message,
                hint: 'Verifique que el bucket "imagenes_fallas" exista en Supabase y que las políticas RLS permitan INSERT.',
            });
        }

        const { data: urlData } = supabase.storage
            .from('imagenes_fallas')
            .getPublicUrl(nombreArchivo);

        const nuevaImagenDb = await imagenService.guardarImagenFalla(id_falla, id_usuario, urlData.publicUrl);

        return res.status(201).json({
            mensaje: 'Imagen subida y registrada con éxito',
            imagen:  nuevaImagenDb,
        });

    } catch (error) {
        if (error.message === 'FALLA_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La falla asociada no existe' });
        }
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para agregar imágenes a esta falla' });
        }
        console.error('[imagen] unexpected error:', error);
        return res.status(500).json({
            error:   'Error interno del servidor',
            detalle: error.message,
        });
    }
};

export const eliminarImagenFalla = async (req, res) => {
    try {
        const id_imagen = parseInt(req.params.id, 10);
        const id_usuario = req.usuario.id;
        const imagenDb = await imagenService.obtenerImagenPorId(id_imagen, id_usuario);

        if (!imagenDb) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }

        // Extraer nombre del archivo desde la URL (asumiendo formato estándar de Supabase)
        const urlParts = imagenDb.url_imagen.split('/');
        const nombreArchivo = urlParts[urlParts.length - 1];

        // Eliminar de Supabase
        const { error } = await supabase.storage
            .from('imagenes_fallas')
            .remove([nombreArchivo]);

        if (error) {
            console.error('[imagen] Supabase error (delete):', error);
            return res.status(500).json({
                error: 'Error al eliminar imagen de almacenamiento',
                detalle: error.message,
            });
        }

        // Eliminar de la base de datos
        await imagenService.eliminarImagenFalla(id_imagen, id_usuario);

        return res.status(200).json({ mensaje: 'Imagen eliminada con éxito' });

    } catch (error) {
        if (error.message === 'NO_AUTORIZADO') {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta imagen' });
        }
        if (error.message === 'IMAGEN_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }
        console.error('[imagen] unexpected error (delete):', error);
        return res.status(500).json({
            error: 'Error interno del servidor al eliminar',
            detalle: error.message,
        });
    }
};