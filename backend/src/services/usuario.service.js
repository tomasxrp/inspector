import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const loginUsuarioService = async(correo, contrasenaPlana) => {
    const usuario = await prisma.usuario.findUnique({
        where: { correo }
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
    const usuarioEncontrado = await prisma.usuario.findUnique({
        where: { correo: datosUsuario.correo }
    });

    if(usuarioEncontrado){
        throw new Error('CORREO_EXISTENTE');
    }

    const saltRounds = 10;
    const contrasenaEncriptada = await bcrypt.hash(datosUsuario.contrasena, saltRounds);

    const nuevoUsuario = await prisma.usuario.create({
        data: {
            ...datosUsuario,
            contrasena: contrasenaEncriptada
        }
    });


    const { contrasena, ...usuarioSinContrasena } = nuevoUsuario;

    return usuarioSinContrasena;
};

export const obtenerUsuariosService = async () => {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nombre: true,
      apellido: true,
      correo: true,
      telefono: true,
      rut: true
    }
  });
  
  return usuarios;
};