import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const guardarImagenFalla = async (id_falla, url_imagen) => {

    const fallaExistente = await prisma.registro_falla.findUnique({
        where: { id: id_falla }
    });

    if (!fallaExistente) {
        throw new Error('FALLA_NO_ENCONTRADA');
    }

    return await prisma.imagen_falla.create({
        data: {
            id_registro_falla: id_falla,
            url_imagen: url_imagen
        }
    });
};