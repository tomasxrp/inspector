import * as dashboardService from '../services/dashboard.service.js';

export const obtenerEstadisticas = async (req, res) => {
    try {
        const stats = await dashboardService.obtenerEstadisticas();
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener estadísticas del dashboard', detalle: error.message });
    }
};
