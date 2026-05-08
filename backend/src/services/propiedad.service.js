import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearPropiedad = async (datosPropiedad) => {

    const usuarioExistente = await prisma.usuario.findUnique({
        where: { id: datosPropiedad.id_usuario }
    });

    if (!usuarioExistente) {
        throw new Error('USUARIO_NO_ENCONTRADO');
    }

    const clienteExistente = await prisma.cliente.findUnique({
        where: { id: datosPropiedad.id_cliente }
    });

    if (!clienteExistente) {
        throw new Error('CLIENTE_NO_ENCONTRADO');
    }


    const nuevaPropiedad = await prisma.propiedad.create({
        data: datosPropiedad
    })


    return nuevaPropiedad;
}


export const obtenerPropiedades = async () => {
    const propiedades = await prisma.propiedad.findMany();
    return propiedades;
}


export const obtenerPropiedadPorId = async (id) => {
    const propiedad = await prisma.propiedad.findUnique({
        where: { id }
    });

    if (!propiedad) {
        throw new Error('PROPIEDAD_NO_ENCONTRADA');
    }

    return propiedad;
}


export const actualizarPropiedad = async (id, datosActualizados) => {
    const propiedadExistente = await prisma.propiedad.findUnique({
        where: { id }
    });

    if (!propiedadExistente) {
        throw new Error('PROPIEDAD_NO_ENCONTRADA');
    }

    const propiedadActualizada = await prisma.propiedad.update({
        where: { id },
        data: {
            ...datosActualizados
        }
    });

    return propiedadActualizada;
}

export const eliminarPropiedad = async (id) => {
    const propiedadExistente = await prisma.propiedad.findUnique({
        where: { id }
    });

    if (!propiedadExistente) {
        throw new Error('PROPIEDAD_NO_ENCONTRADA');
    }

    await prisma.propiedad.delete({
        where: { id }
    });
}