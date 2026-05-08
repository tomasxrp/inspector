import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const registrarFalla = async (datosFalla) => {
    // Verificar que la revisión exista antes de anotar la falla
    const revisionExistente = await prisma.revision.findUnique({
        where: { id: datosFalla.id_revision }
    });

    if (!revisionExistente) {
        throw new Error('REVISION_NO_ENCONTRADA');
    }

    return await prisma.registro_falla.create({
        data: datosFalla
    });
};

export const obtenerFallasPorRevision = async (id_revision) => {
    // Obtener todas las fallas de una revisión específica, incluyendo sus imágenes
    return await prisma.registro_falla.findMany({
        where: { id_revision },
        include: { imagenes: true } 
    });
};

export const obtenerFallaPorId = async (id) => {
    const falla = await prisma.registro_falla.findUnique({
        where: { id },
        include: { imagenes: true }
    });

    if (!falla) {
        throw new Error('FALLA_NO_ENCONTRADA');
    }

    return falla;
};

export const actualizarFalla = async (id, datosActualizados) => {
    const fallaExistente = await prisma.registro_falla.findUnique({
        where: { id }
    });

    if (!fallaExistente) {
        throw new Error('FALLA_NO_ENCONTRADA');
    }

    return await prisma.registro_falla.update({
        where: { id },
        data: datosActualizados
    });
};

export const eliminarFalla = async (id) => {
    const fallaExistente = await prisma.registro_falla.findUnique({
        where: { id }
    });

    if (!fallaExistente) {
        throw new Error('FALLA_NO_ENCONTRADA');
    }

    await prisma.registro_falla.delete({
        where: { id }
    });
};