import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearCliente = async (datosCliente, id_usuario) => {
    const correoNormalizado = datosCliente.correo.toLowerCase().trim();

    // Validar si este inspector ya tiene registrado a este cliente
    const clienteEncontrado = await prisma.cliente.findFirst({
        where: {
            id_usuario,
            correo: correoNormalizado
        }
    });

    if (clienteEncontrado) {
        throw new Error('CORREO_EXISTENTE');
    }

    const nuevoCliente = await prisma.cliente.create({
        data: {
            nombre: datosCliente.nombre.trim(),
            apellido: datosCliente.apellido.trim(),
            correo: correoNormalizado,
            telefono: datosCliente.telefono.trim(),
            id_usuario
        }
    });

    return nuevoCliente;
};

export const obtenerClientes = async (id_usuario) => {
    const clientes = await prisma.cliente.findMany({
        where: { id_usuario },
        orderBy: { id: 'desc' },
        include: {
            propiedades: {
                select: { id: true, direccion: true, comuna: true, tipo_propiedad: true }
            }
        }
    });
    return clientes;
};

export const obtenerClientePorCorreo = async (correo, id_usuario) => {
    const correoNormalizado = correo.toLowerCase().trim();
    const cliente = await prisma.cliente.findFirst({
        where: {
            correo: correoNormalizado,
            id_usuario
        },
        include: {
            propiedades: true
        }
    });

    if (!cliente) {
        throw new Error('CLIENTE_NO_ENCONTRADO');
    }

    return cliente;
};

export const actualizarCliente = async (correo, id_usuario, datosActualizados) => {
    const correoNormalizado = correo.toLowerCase().trim();
    const clienteExistente = await prisma.cliente.findFirst({
        where: {
            correo: correoNormalizado,
            id_usuario
        }
    });

    if (!clienteExistente) {
        throw new Error('CLIENTE_NO_ENCONTRADO');
    }

    const clienteActualizado = await prisma.cliente.update({
        where: { id: clienteExistente.id },
        data: {
            nombre: datosActualizados.nombre ? datosActualizados.nombre.trim() : undefined,
            apellido: datosActualizados.apellido ? datosActualizados.apellido.trim() : undefined,
            telefono: datosActualizados.telefono ? datosActualizados.telefono.trim() : undefined
        }
    });

    return clienteActualizado;
};

export const eliminarCliente = async (correo, id_usuario) => {
    const correoNormalizado = correo.toLowerCase().trim();
    const clienteExistente = await prisma.cliente.findFirst({
        where: {
            correo: correoNormalizado,
            id_usuario
        },
        include: { propiedades: true }
    });

    if (!clienteExistente) {
        throw new Error('CLIENTE_NO_ENCONTRADO');
    }

    if (clienteExistente.propiedades.length > 0) {
        throw new Error('CLIENTE_TIENE_PROPIEDADES');
    }

    await prisma.cliente.delete({ where: { id: clienteExistente.id } });
};