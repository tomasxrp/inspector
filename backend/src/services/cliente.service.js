import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearCliente = async (datosCliente) => {

    const clienteEncontrado = await prisma.cliente.findUnique({
        where: { correo: datosCliente.correo }
    });

    if(clienteEncontrado){
        throw new Error('CORREO_EXISTENTE');
    }

    const nuevoCliente = await prisma.cliente.create({
        data: {
            ...datosCliente
        }
    });

    return nuevoCliente;
}


export const obtenerClientes = async () => {
    const clientes = await prisma.cliente.findMany();
    return clientes;
}

export const obtenerClientePorCorreo = async (correo) => {
    const cliente = await prisma.cliente.findUnique({
        where: { correo }
    });

    if (!cliente) {
        throw new Error('CLIENTE_NO_ENCONTRADO');
    }

    return cliente;
}


export const actualizarCliente = async (correo, datosActualizados) => {
    const clienteExistente = await prisma.cliente.findUnique({
        where: { correo }
    });

    if (!clienteExistente) {
        throw new Error('CLIENTE_NO_ENCONTRADO');
    }

    const clienteActualizado = await prisma.cliente.update({
        where: { correo },
        data: {
            ...datosActualizados
        }
    });

    return clienteActualizado;
}

export const eliminarCliente = async (correo) => {
    const clienteExistente = await prisma.cliente.findUnique({
        where: { correo }
    });

    if (!clienteExistente) {
        throw new Error('CLIENTE_NO_ENCONTRADO');
    }

    await prisma.cliente.delete({
        where: { correo }
    });
}