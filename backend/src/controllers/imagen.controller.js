import { supabase } from '../config/supabase.config.js';
import * as imagenService from '../services/imagen.service.js';

export const subirImagenFalla = async (req, res) => {
    try {
        const id_falla = parseInt(req.params.id_falla, 10);
        const archivo = req.file; // Multer nos deja el archivo aquí

        if (!archivo) {
            return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
        }

        // 1. Crear un nombre único para la imagen (ej: 123-169876543.jpg)
        const nombreArchivo = `${id_falla}-${Date.now()}-${archivo.originalname.replace(/\s+/g, '_')}`;

        // 2. Subir el archivo al bucket de Supabase
        const { data, error } = await supabase.storage
            .from('imagenes_fallas')
            .upload(nombreArchivo, archivo.buffer, {
                contentType: archivo.mimetype
            });

        if (error) {
            throw new Error(`Error de Supabase: ${error.message}`);
        }

        // 3. Obtener la URL pública de la imagen recién subida
        const { data: urlPublica } = supabase.storage
            .from('imagenes_fallas')
            .getPublicUrl(nombreArchivo);

        // 4. Guardar esa URL en nuestra base de datos con Prisma
        const nuevaImagenDb = await imagenService.guardarImagenFalla(id_falla, urlPublica.publicUrl);

        res.status(201).json({
            mensaje: 'Imagen subida y registrada con éxito',
            imagen: nuevaImagenDb
        });

    } catch (error) {
        if (error.message === 'FALLA_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La falla asociada no existe' });
        }
        res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
    }
};