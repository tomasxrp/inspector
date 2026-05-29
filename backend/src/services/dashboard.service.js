import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerEstadisticas = async () => {
    const totalPropiedades = await prisma.propiedad.count();
    const totalRevisiones = await prisma.revision.count();

    const fallasPorGravedadData = await prisma.registro_falla.groupBy({
        by: ['nivel_gravedad'],
        _count: { id: true }
    });

    const fallasPorCategoriaData = await prisma.registro_falla.groupBy({
        by: ['categoria_falla'],
        _count: { id: true }
    });

    const propiedadesPorTipoData = await prisma.propiedad.groupBy({
        by: ['tipo_propiedad'],
        _count: { id: true }
    });

    const ultimasRevisiones = await prisma.revision.findMany({
        take: 5,
        orderBy: { fecha_revision: 'desc' },
        include: {
            propiedad: {
                select: { direccion: true, comuna: true, tipo_propiedad: true }
            }
        }
    });

    const totalFallas = fallasPorGravedadData.reduce((acc, curr) => acc + curr._count.id, 0);

    const fallasPorGravedad = fallasPorGravedadData.map(f => ({
        name: f.nivel_gravedad,
        value: f._count.id
    }));

    const fallasPorCategoria = fallasPorCategoriaData
        .map(f => ({
            name: f.categoria_falla,
            value: f._count.id
        }))
        .sort((a, b) => b.value - a.value);

    const propiedadesPorTipo = propiedadesPorTipoData.map(p => ({
        name: p.tipo_propiedad,
        value: p._count.id
    }));

    return {
        totalPropiedades,
        totalRevisiones,
        totalFallas,
        fallasPorGravedad,
        fallasPorCategoria,
        propiedadesPorTipo,
        ultimasRevisiones
    };
};
