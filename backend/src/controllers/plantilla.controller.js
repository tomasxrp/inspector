import * as plantillaService from '../services/plantilla.service.js';

export const getPlantillas = async (req, res) => {
  try {
    const plantillas = await plantillaService.getAllPlantillas();
    res.json(plantillas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlantilla = async (req, res) => {
  try {
    const { id } = req.params;
    const plantilla = await plantillaService.getPlantillaById(id);
    if (!plantilla) return res.status(404).json({ error: 'Plantilla no encontrada' });
    res.json(plantilla);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPlantilla = async (req, res) => {
  try {
    const data = req.body;
    const nuevaPlantilla = await plantillaService.createPlantilla(data);
    res.status(201).json(nuevaPlantilla);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePlantilla = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const plantilla = await plantillaService.updatePlantilla(id, data);
    res.json(plantilla);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePlantilla = async (req, res) => {
  try {
    const { id } = req.params;
    await plantillaService.deletePlantilla(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
