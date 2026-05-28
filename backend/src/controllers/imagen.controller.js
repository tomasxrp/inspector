import { supabase } from '../config/supabase.config.js';
import * as imagenService from '../services/imagen.service.js';

export const subirImagenFalla = async (req, res) => {
    try {
        const id_falla = parseInt(req.params.id_falla, 10);
        const archivo  = req.file;

        if (!archivo) {
            return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
        }

        // ── Diagnostics (remove once working) ──────────────────
        console.log('[imagen] buffer size   :', archivo.buffer?.length ?? 'undefined');
        console.log('[imagen] mimetype      :', archivo.mimetype);
        console.log('[imagen] SUPABASE_URL  :', process.env.SUPABASE_PROJECT_URL);
        // ────────────────────────────────────────────────────────

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

        console.log('[imagen] uploading as  :', nombreArchivo);

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
                // Extra context to help diagnose
                hint: 'Verifique que el bucket "imagenes_fallas" exista en Supabase y que las políticas RLS permitan INSERT.',
            });
        }

        console.log('[imagen] upload ok, path:', data?.path);

        const { data: urlData } = supabase.storage
            .from('imagenes_fallas')
            .getPublicUrl(nombreArchivo);

        const nuevaImagenDb = await imagenService.guardarImagenFalla(id_falla, urlData.publicUrl);

        return res.status(201).json({
            mensaje: 'Imagen subida y registrada con éxito',
            imagen:  nuevaImagenDb,
        });

    } catch (error) {
        if (error.message === 'FALLA_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La falla asociada no existe' });
        }
        console.error('[imagen] unexpected error:', error);
        return res.status(500).json({
            error:   'Error interno del servidor',
            detalle: error.message,
        });
    }
};