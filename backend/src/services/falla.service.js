import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const registrarFalla = async (datosFalla) => {
    const revisionExistente = await prisma.revision.findUnique({
        where: { id: datosFalla.id_revision }
    });

    if (!revisionExistente) throw new Error('REVISION_NO_ENCONTRADA');

    return await prisma.registro_falla.create({ data: datosFalla });
};

export const obtenerFallasPorRevision = async (id_revision) => {
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

    if (!falla) throw new Error('FALLA_NO_ENCONTRADA');
    return falla;
};

export const actualizarFalla = async (id, datosActualizados) => {
    const fallaExistente = await prisma.registro_falla.findUnique({ where: { id } });
    if (!fallaExistente) throw new Error('FALLA_NO_ENCONTRADA');

    return await prisma.registro_falla.update({
        where: { id },
        data: datosActualizados
    });
};

/**
 * Cascade-delete: first remove images, then the fault record.
 */
export const eliminarFalla = async (id) => {
    const fallaExistente = await prisma.registro_falla.findUnique({
        where: { id },
        include: { imagenes: true }
    });

    if (!fallaExistente) throw new Error('FALLA_NO_ENCONTRADA');

    await prisma.$transaction(async (tx) => {
        await tx.imagen_falla.deleteMany({ where: { id_registro_falla: id } });
        await tx.registro_falla.delete({ where: { id } });
    });
};