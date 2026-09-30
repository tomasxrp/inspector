import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllPlantillas = async () => {
  return await prisma.plantilla.findMany({
    orderBy: { fecha_creacion: 'desc' },
  });
};

export const getPlantillaById = async (id) => {
  return await prisma.plantilla.findUnique({
    where: { id: parseInt(id) },
  });
};

export const createPlantilla = async (data) => {
  return await prisma.plantilla.create({
    data,
  });
};

export const updatePlantilla = async (id, data) => {
  return await prisma.plantilla.update({
    where: { id: parseInt(id) },
    data,
  });
};

export const deletePlantilla = async (id) => {
  return await prisma.plantilla.delete({
    where: { id: parseInt(id) },
  });
};
