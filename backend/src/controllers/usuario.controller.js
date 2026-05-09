import * as usuarioService from '../services/usuario.service.js';

export const login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const resultado = await usuarioService.loginUsuarioService(correo, contrasena);

        res.status(200).json({
            mensaje: 'Login exitoso',
            usuario: resultado.usuario,
            token: resultado.token
        });
    } catch (error) {
        if (error.message === 'CREDENTIALS_INVALID') {
            return res.status(401).json({ error: "Correo o contraseña inválidos" });
        }
        res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
    }
}

export const registrarUsuario = async (req, res) => {
    try {
        const { nombre, apellido, correo, contrasena, telefono, rut, direccion } = req.body;

        if (!nombre || !apellido || !correo || !contrasena || !telefono) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const nuevoUsuario = await usuarioService.registroUsuarioService({
            nombre,
            apellido,
            correo,
            contrasena,
            telefono,
            rut,
            direccion
        });

        res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario: nuevoUsuario });

    } catch (error) {
        if (error.message === 'CORREO_EXISTENTE') {
            return res.status(409).json({ error: 'El correo ya está registrado' });
        }
        res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
    }
}

export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.obtenerUsuariosService();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios', detalle: error.message });
  }
};