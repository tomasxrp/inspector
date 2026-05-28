import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearPropiedad = async (datosPropiedad) => {
    const usuarioExistente = await prisma.usuario.findUnique({
        where: { id: datosPropiedad.id_usuario }
    });

    if (!usuarioExistente) throw new Error('USUARIO_NO_ENCONTRADO');

    const clienteExistente = await prisma.cliente.findUnique({
        where: { id: datosPropiedad.id_cliente }
    });

    if (!clienteExistente) throw new Error('CLIENTE_NO_ENCONTRADO');

    return await prisma.propiedad.create({ data: datosPropiedad });
};

export const obtenerPropiedades = async () => {
    return await prisma.propiedad.findMany();
};

export const obtenerPropiedadPorId = async (id) => {
    const propiedad = await prisma.propiedad.findUnique({ where: { id } });
    if (!propiedad) throw new Error('PROPIEDAD_NO_ENCONTRADA');
    return propiedad;
};

export const actualizarPropiedad = async (id, datosActualizados) => {
    const propiedadExistente = await prisma.propiedad.findUnique({ where: { id } });
    if (!propiedadExistente) throw new Error('PROPIEDAD_NO_ENCONTRADA');

    return await prisma.propiedad.update({
        where: { id },
        data: { ...datosActualizados }
    });
};

/**
 * Cascade-delete a property:
 * imagen_falla → registro_falla → informe_revision → revision → propiedad
 * All in one transaction so it's atomic.
 */
export const eliminarPropiedad = async (id) => {
    const propiedadExistente = await prisma.propiedad.findUnique({
        where: { id },
        include: {
            revisiones: {
                include: {
                    fallas: { include: { imagenes: true } },
                    informe_revision: true
                }
            }
        }
    });

    if (!propiedadExistente) throw new Error('PROPIEDAD_NO_ENCONTRADA');

    await prisma.$transaction(async (tx) => {
        for (const revision of propiedadExistente.revisiones) {
            // 1. Delete all fault images
            for (const falla of revision.fallas) {
                await tx.imagen_falla.deleteMany({ where: { id_registro_falla: falla.id } });
            }
            // 2. Delete all faults
            await tx.registro_falla.deleteMany({ where: { id_revision: revision.id } });
            // 3. Delete report if exists
            if (revision.informe_revision) {
                await tx.informe_revision.delete({ where: { id_revision: revision.id } });
            }
            // 4. Delete revision
            await tx.revision.delete({ where: { id: revision.id } });
        }
        // 5. Delete the property itself
        await tx.propiedad.delete({ where: { id } });
    });
};