import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const registrarFalla = async (datosFalla, id_usuario) => {
    const revisionExistente = await prisma.revision.findUnique({
        where: { id: datosFalla.id_revision }
    });

    if (!revisionExistente) throw new Error('REVISION_NO_ENCONTRADA');
    if (revisionExistente.id_usuario !== id_usuario) throw new Error('NO_AUTORIZADO');

    return await prisma.registro_falla.create({ data: datosFalla });
};

export const obtenerFallasPorRevision = async (id_revision, id_usuario) => {
    const revisionExistente = await prisma.revision.findUnique({
        where: { id: id_revision }
    });

    if (!revisionExistente) throw new Error('REVISION_NO_ENCONTRADA');
    if (revisionExistente.id_usuario !== id_usuario) throw new Error('NO_AUTORIZADO');

    return await prisma.registro_falla.findMany({
        where: { id_revision },
        include: { imagenes: true }
    });
};

export const obtenerFallaPorId = async (id, id_usuario) => {
    const falla = await prisma.registro_falla.findUnique({
        where: { id },
        include: {
            imagenes: true,
            revision: true
        }
    });

    if (!falla) throw new Error('FALLA_NO_ENCONTRADA');
    if (falla.revision.id_usuario !== id_usuario) throw new Error('NO_AUTORIZADO');
    return falla;
};

export const actualizarFalla = async (id, id_usuario, datosActualizados) => {
    const fallaExistente = await prisma.registro_falla.findUnique({
        where: { id },
        include: { revision: true }
    });
    if (!fallaExistente) throw new Error('FALLA_NO_ENCONTRADA');
    if (fallaExistente.revision.id_usuario !== id_usuario) throw new Error('NO_AUTORIZADO');

    return await prisma.registro_falla.update({
        where: { id },
        data: datosActualizados
    });
};

export const eliminarFalla = async (id, id_usuario) => {
    const fallaExistente = await prisma.registro_falla.findUnique({
        where: { id },
        include: {
            imagenes: true,
            revision: true
        }
    });

    if (!fallaExistente) throw new Error('FALLA_NO_ENCONTRADA');
    if (fallaExistente.revision.id_usuario !== id_usuario) throw new Error('NO_AUTORIZADO');

    await prisma.$transaction(async (tx) => {
        await tx.imagen_falla.deleteMany({ where: { id_registro_falla: id } });
        await tx.registro_falla.delete({ where: { id } });
    });
};