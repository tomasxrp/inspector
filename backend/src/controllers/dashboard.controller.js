import * as dashboardService from '../services/dashboard.service.js';

export const obtenerEstadisticas = async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const stats = await dashboardService.obtenerEstadisticas(id_usuario);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener estadísticas del dashboard', detalle: error.message });
    }
};

