import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const guardarImagenFalla = async (id_falla, id_usuario, url_imagen) => {
    const fallaExistente = await prisma.registro_falla.findUnique({
        where: { id: id_falla },
        include: { revision: true }
    });

    if (!fallaExistente) {
        throw new Error('FALLA_NO_ENCONTRADA');
    }

    if (fallaExistente.revision.id_usuario !== id_usuario) {
        throw new Error('NO_AUTORIZADO');
    }

    return await prisma.imagen_falla.create({
        data: {
            id_registro_falla: id_falla,
            url_imagen: url_imagen
        }
    });
};

export const obtenerImagenPorId = async (id, id_usuario) => {
    const imagen = await prisma.imagen_falla.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
            falla: {
                include: { revision: true }
            }
        }
    });

    if (!imagen) return null;
    if (imagen.falla.revision.id_usuario !== id_usuario) {
        throw new Error('NO_AUTORIZADO');
    }

    return imagen;
};

export const eliminarImagenFalla = async (id, id_usuario) => {
    const imagen = await prisma.imagen_falla.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
            falla: {
                include: { revision: true }
            }
        }
    });

    if (!imagen) throw new Error('IMAGEN_NO_ENCONTRADA');
    if (imagen.falla.revision.id_usuario !== id_usuario) {
        throw new Error('NO_AUTORIZADO');
    }

    return await prisma.imagen_falla.delete({
        where: { id: parseInt(id, 10) }
    });
};