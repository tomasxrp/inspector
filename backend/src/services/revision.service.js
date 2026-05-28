import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearRevision = async (datosRevision) => {
    const propiedadExistente = await prisma.propiedad.findUnique({
        where: { id: datosRevision.id_propiedad }
    });

    if (!propiedadExistente) throw new Error('PROPIEDAD_NO_ENCONTRADA');

    return await prisma.revision.create({
        data: {
            id_propiedad: datosRevision.id_propiedad,
            id_usuario: datosRevision.id_usuario,
            categoria_observacion: datosRevision.categoria_observacion,
            descripcion_general: datosRevision.descripcion_general,
        }
    });
};

export const obtenerRevisionesPorPropiedad = async (id_propiedad) => {
    return await prisma.revision.findMany({
        where: { id_propiedad },
        include: {
            fallas: { include: { imagenes: true } },
            informe_revision: true
        }
    });
};

export const obtenerRevisionPorId = async (id_revision) => {
    const revision = await prisma.revision.findUnique({
        where: { id: id_revision },
        include: {
            propiedad: { include: { cliente: true, usuario: true } },
            fallas: { include: { imagenes: true } },
            informe_revision: true
        }
    });

    if (!revision) throw new Error('REVISION_NO_ENCONTRADA');
    return revision;
};

/**
 * Cascade-delete a revision:
 * imagen_falla → registro_falla → informe_revision → revision
 */
export const eliminarRevision = async (id_revision) => {
    const revision = await prisma.revision.findUnique({
        where: { id: id_revision },
        include: {
            fallas: { include: { imagenes: true } },
            informe_revision: true
        }
    });

    if (!revision) throw new Error('REVISION_NO_ENCONTRADA');

    await prisma.$transaction(async (tx) => {
        for (const falla of revision.fallas) {
            await tx.imagen_falla.deleteMany({ where: { id_registro_falla: falla.id } });
        }
        await tx.registro_falla.deleteMany({ where: { id_revision } });
        if (revision.informe_revision) {
            await tx.informe_revision.delete({ where: { id_revision } });
        }
        await tx.revision.delete({ where: { id: id_revision } });
    });
};

export const actualizarRevision = async (id, datosActualizados) => {
    const revisionExistente = await prisma.revision.findUnique({ where: { id } });
    if (!revisionExistente) throw new Error('REVISION_NO_ENCONTRADA');

    return await prisma.revision.update({
        where: { id },
        data: datosActualizados
    });
};