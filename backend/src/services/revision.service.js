import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearRevision = async (datosRevision) => {
    const propiedadExistente = await prisma.propiedad.findUnique({
        where: { id: datosRevision.id_propiedad }
    });

    if (!propiedadExistente) throw new Error('PROPIEDAD_NO_ENCONTRADA');
    
    // Verificación estricta: La propiedad debe pertenecer al usuario autenticado
    if (propiedadExistente.id_usuario !== datosRevision.id_usuario) {
        throw new Error('NO_AUTORIZADO');
    }

    return await prisma.revision.create({
        data: {
            id_propiedad: datosRevision.id_propiedad,
            id_usuario: datosRevision.id_usuario,
            categoria_observacion: datosRevision.categoria_observacion,
            descripcion_general: datosRevision.descripcion_general,
        }
    });
};

export const obtenerMisRevisiones = async (id_usuario) => {
    return await prisma.revision.findMany({
        where: { id_usuario },
        orderBy: { id: 'desc' },
        include: {
            propiedad: {
                include: { cliente: true }
            },
            fallas: { include: { imagenes: true } },
            informe_revision: true
        }
    });
};

export const obtenerRevisionesPorPropiedad = async (id_propiedad, id_usuario) => {
    const propiedad = await prisma.propiedad.findUnique({
        where: { id: id_propiedad }
    });

    if (!propiedad) throw new Error('PROPIEDAD_NO_ENCONTRADA');
    if (propiedad.id_usuario !== id_usuario) throw new Error('NO_AUTORIZADO');

    return await prisma.revision.findMany({
        where: { id_propiedad, id_usuario },
        include: {
            fallas: { include: { imagenes: true } },
            informe_revision: true
        }
    });
};

export const obtenerRevisionPorId = async (id_revision, id_usuario) => {
    const revision = await prisma.revision.findUnique({
        where: { id: id_revision },
        include: {
            propiedad: { include: { cliente: true, usuario: true } },
            fallas: { include: { imagenes: true } },
            informe_revision: true
        }
    });

    if (!revision) throw new Error('REVISION_NO_ENCONTRADA');
    // Verificación estricta de pertenencia al usuario
    if (revision.id_usuario !== id_usuario) throw new Error('NO_AUTORIZADO');

    return revision;
};

/**
 * Cascade-delete a revision strictly verifying ownership:
 * imagen_falla → registro_falla → informe_revision → revision
 */
export const eliminarRevision = async (id_revision, id_usuario) => {
    const revision = await prisma.revision.findUnique({
        where: { id: id_revision },
        include: {
            fallas: { include: { imagenes: true } },
            informe_revision: true
        }
    });

    if (!revision) throw new Error('REVISION_NO_ENCONTRADA');
    if (revision.id_usuario !== id_usuario) throw new Error('NO_AUTORIZADO');

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

export const actualizarRevision = async (id, id_usuario, datosActualizados) => {
    const revisionExistente = await prisma.revision.findUnique({ where: { id } });
    if (!revisionExistente) throw new Error('REVISION_NO_ENCONTRADA');
    if (revisionExistente.id_usuario !== id_usuario) throw new Error('NO_AUTORIZADO');

    return await prisma.revision.update({
        where: { id },
        data: datosActualizados
    });
};