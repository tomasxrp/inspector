import * as usuarioService from '../services/usuario.service.js';

// Regex estándar para validación estricta de correo electrónico
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ error: 'Debe ingresar correo y contraseña' });
        }

        const resultado = await usuarioService.loginUsuarioService(correo, contrasena);

        res.status(200).json({
            mensaje: 'Login exitoso',
            usuario: resultado.usuario,
            token: resultado.token
        });
    } catch (error) {
        if (error.message === 'CREDENTIALS_INVALID') {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }
        res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
    }
};

export const registrarUsuario = async (req, res) => {
    try {
        const { nombre, apellido, correo, contrasena, telefono, rut, direccion } = req.body;

        // Validar presencia de campos requeridos
        if (!nombre || !apellido || !correo || !contrasena || !telefono) {
            return res.status(400).json({ error: 'Nombre, apellido, correo, contraseña y teléfono son obligatorios' });
        }

        // Validar formato de correo
        if (!EMAIL_REGEX.test(correo.trim())) {
            return res.status(400).json({ error: 'El formato del correo electrónico no es válido' });
        }

        // Validar longitud y seguridad de la contraseña
        if (typeof contrasena !== 'string' || contrasena.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Validar longitudes mínimas para nombres
        if (nombre.trim().length < 2 || apellido.trim().length < 2) {
            return res.status(400).json({ error: 'El nombre y apellido deben tener al menos 2 caracteres' });
        }

        const resultado = await usuarioService.registroUsuarioService({
            nombre,
            apellido,
            correo,
            contrasena,
            telefono,
            rut,
            direccion
        });

        res.status(201).json({
            mensaje: 'Usuario registrado con éxito',
            usuario: resultado.usuario,
            token: resultado.token
        });

    } catch (error) {
        if (error.message === 'CORREO_EXISTENTE') {
            return res.status(409).json({ error: 'Este correo electrónico ya se encuentra registrado' });
        }
        res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
    }
};

export const obtenerPerfil = async (req, res) => {
    try {
        const usuario = await usuarioService.obtenerPerfilUsuarioService(req.usuario.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el perfil de usuario', detalle: error.message });
    }
};