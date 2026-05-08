import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearRevision = async (datosRevision) => {
    const propiedadExistente = await prisma.propiedad.findUnique({
        where: { id: datosRevision.id_propiedad }
    });

    if (!propiedadExistente) {
        throw new Error('PROPIEDAD_NO_ENCONTRADA');
    }

    // Crear la revisión
    const nuevaRevision = await prisma.revision.create({
        data: {
            id_propiedad: datosRevision.id_propiedad,
            id_usuario: datosRevision.id_usuario,
            categoria_observacion: datosRevision.categoria_observacion,
            descripcion_general: datosRevision.descripcion_general,
            // la fecha se genera automáticamente por el @default(now()) del esquema
        }
    });

    return nuevaRevision;
};

export const obtenerRevisionesPorPropiedad = async (id_propiedad) => {
    return await prisma.revision.findMany({
        where: { id_propiedad },
        include: {
            fallas: {
                include: { imagenes: true }
            },
            informe_revision: true
        }
    });
};


export const obtenerRevisionPorId = async (id_revision) => {
    
    const revisionEncontrada = await prisma.revision.findUnique({
        where: { id: id_revision },
        include: {
            fallas: {
                include: { imagenes: true }
            },
            informe_revision: true
        }
    });

    if (!revisionEncontrada) {
        throw new Error('REVISION_NO_ENCONTRADA');
    }
    
    return revisionEncontrada;

}

export const eliminarRevision = async (id_revision) => {
    const revisionExistente = await prisma.revision.findUnique({
        where: { id: id_revision }
    });

    if (!revisionExistente) {
        throw new Error('REVISION_NO_ENCONTRADA');
    }

    await prisma.revision.delete({
        where: { id: id_revision }
    });
}


export const actualizarRevision = async (id, datosActualizados) => {
    const revisionExistente = await prisma.revision.findUnique({
        where: { id }
    });

    if (!revisionExistente) {
        throw new Error('REVISION_NO_ENCONTRADA');
    }

    return await prisma.revision.update({
        where: { id },
        data: datosActualizados
    });
};


