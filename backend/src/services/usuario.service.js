import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const loginUsuarioService = async (correo, contrasenaPlana) => {
    const correoNormalizado = correo.toLowerCase().trim();

    const usuario = await prisma.usuario.findUnique({
        where: { correo: correoNormalizado }
    });

    if (!usuario) {
        throw new Error('CREDENTIALS_INVALID');
    }

    const contrasenaValida = await bcrypt.compare(contrasenaPlana, usuario.contrasena);

    if (!contrasenaValida) {
        throw new Error('CREDENTIALS_INVALID');
    }

    const token = jwt.sign(
        { id: usuario.id, correo: usuario.correo },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    const { contrasena, ...usuarioSinContrasena } = usuario;

    return {
        usuario: usuarioSinContrasena,
        token
    };
};

export const registroUsuarioService = async (datosUsuario) => {
    const correoNormalizado = datosUsuario.correo.toLowerCase().trim();

    const usuarioEncontrado = await prisma.usuario.findUnique({
        where: { correo: correoNormalizado }
    });

    if (usuarioEncontrado) {
        throw new Error('CORREO_EXISTENTE');
    }

    const saltRounds = 10;
    const contrasenaEncriptada = await bcrypt.hash(datosUsuario.contrasena, saltRounds);

    const nuevoUsuario = await prisma.usuario.create({
        data: {
            nombre: datosUsuario.nombre.trim(),
            apellido: datosUsuario.apellido.trim(),
            correo: correoNormalizado,
            contrasena: contrasenaEncriptada,
            telefono: datosUsuario.telefono.trim(),
            rut: datosUsuario.rut ? datosUsuario.rut.trim() : null,
            direccion: datosUsuario.direccion ? datosUsuario.direccion.trim() : null
        }
    });

    const { contrasena, ...usuarioSinContrasena } = nuevoUsuario;

    // Generar token JWT inmediatamente tras el registro exitoso
    const token = jwt.sign(
        { id: nuevoUsuario.id, correo: nuevoUsuario.correo },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return {
        usuario: usuarioSinContrasena,
        token
    };
};

export const obtenerPerfilUsuarioService = async (idUsuario) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id: idUsuario },
        select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            rut: true,
            direccion: true
        }
    });

    return usuario;
};