import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearInforme = async (id_revision, id_usuario, datosInforme) => {
    const revisionExistente = await prisma.revision.findUnique({
        where: { id: id_revision }
    });

    if (!revisionExistente) {
        throw new Error('REVISION_NO_ENCONTRADA');
    }

    if (revisionExistente.id_usuario !== id_usuario) {
        throw new Error('NO_AUTORIZADO');
    }

    const informeExistente = await prisma.informe_revision.findUnique({
        where: { id_revision }
    });

    if (informeExistente) {
        throw new Error('INFORME_YA_EXISTE');
    }

    return await prisma.informe_revision.create({
        data: {
            id_revision,
            veredicto_final: datosInforme.veredicto_final,
            observaciones_cliente: datosInforme.observaciones_cliente,
            url_pdf: datosInforme.url_pdf // Opcional, puede ser null al inicio
        }
    });
};

export const obtenerInformeCompleto = async (id_revision, id_usuario) => {
    const informe = await prisma.informe_revision.findUnique({
        where: { id_revision },
        include: {
            revision: {
                include: {
                    propiedad: {
                        include: { cliente: true, usuario: true }
                    },
                    fallas: {
                        include: { imagenes: true }
                    }
                }
            }
        }
    });

    if (!informe) {
        throw new Error('INFORME_NO_ENCONTRADO');
    }

    if (informe.revision.id_usuario !== id_usuario) {
        throw new Error('NO_AUTORIZADO');
    }

    return informe;
};

export const actualizarInforme = async (id_revision, id_usuario, datosActualizados) => {
    const informeExistente = await prisma.informe_revision.findUnique({
        where: { id_revision },
        include: { revision: true }
    });

    if (!informeExistente) {
        throw new Error('INFORME_NO_ENCONTRADO');
    }

    if (informeExistente.revision.id_usuario !== id_usuario) {
        throw new Error('NO_AUTORIZADO');
    }

    return await prisma.informe_revision.update({
        where: { id_revision },
        data: datosActualizados
    });
};