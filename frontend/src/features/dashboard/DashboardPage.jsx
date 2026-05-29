import { useState, useEffect } from 'react';
import { getEstadisticas } from './dashboardService';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { getFallaColor } from '../fallas/fallaConstants';
import { formatDisplayDate } from '../../utils/dateUtils';
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEstadisticas()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8"><LoadingSpinner text="Cargando estadísticas..." /></div>;
  if (!stats) return <div className="p-8 text-red-400">Error al cargar dashboard</div>;

  const getGravedadColorHex = (nivel) => {
    if (nivel === 'Alta') return '#ef4444'; // red-500
    if (nivel === 'Media') return '#f59e0b'; // amber-500
    if (nivel === 'Baja') return '#52525b'; // zinc-600
    return '#8b5cf6';
  };

  const getColorHex = (catName) => {
    const color = getFallaColor(catName);
    switch (color) {
      case 'red': return '#ef4444';
      case 'amber': return '#f59e0b';
      case 'blue': return '#3b82f6';
      case 'green': return '#22c55e';
      default: return '#71717a';
    }
  };

  const getPropiedadTypeColor = (index) => {
    const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f43f5e', '#8b5cf6'];
    return colors[index % colors.length];
  };

  // Data for Gravedad Doughnut
  const gravedadData = {
    labels: stats.fallasPorGravedad.map((f) => f.name),
    datasets: [
      {
        data: stats.fallasPorGravedad.map((f) => f.value),
        backgroundColor: stats.fallasPorGravedad.map((f) => getGravedadColorHex(f.name)),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  // Data for Categorias Bar Chart
  const topCategorias = stats.fallasPorCategoria.slice(0, 5);
  const categoriasData = {
    labels: topCategorias.map((f) => f.name),
    datasets: [
      {
        label: 'Cantidad de Fallas',
        data: topCategorias.map((f) => f.value),
        backgroundColor: topCategorias.map((f) => getColorHex(f.name)),
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa' } },
      y: { grid: { display: false }, ticks: { color: '#d4d4d8' } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#d4d4d8', padding: 20 } },
    },
    cutout: '70%',
  };

  // Data for Propiedades por Tipo Doughnut
  const propiedadesData = {
    labels: stats.propiedadesPorTipo.map((p) => p.name),
    datasets: [
      {
        data: stats.propiedadesPorTipo.map((p) => p.value),
        backgroundColor: stats.propiedadesPorTipo.map((_, i) => getPropiedadTypeColor(i)),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Resumen general de inspecciones" />
      <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col items-center justify-center transform hover:scale-[1.02] transition-transform duration-300">
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Propiedades</p>
            <p className="text-5xl font-mono font-black text-white">{stats.totalPropiedades}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col items-center justify-center transform hover:scale-[1.02] transition-transform duration-300">
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Revisiones</p>
            <p className="text-5xl font-mono font-black text-blue-400">{stats.totalRevisiones}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col items-center justify-center transform hover:scale-[1.02] transition-transform duration-300">
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Total Fallas</p>
            <p className="text-5xl font-mono font-black text-amber-400">{stats.totalFallas}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-zinc-900 border border-zinc-800 p-6">
            <h3 className="text-zinc-300 font-mono text-sm uppercase tracking-widest mb-6 text-center">
              Fallas por Gravedad
            </h3>
            <div className="h-64 w-full">
              {stats.fallasPorGravedad.length > 0 ? (
                <Doughnut data={gravedadData} options={doughnutOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-xs">Sin datos</div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6">
            <h3 className="text-zinc-300 font-mono text-sm uppercase tracking-widest mb-6 text-center">
              Fallas más Comunes (Top 5)
            </h3>
            <div className="h-64 w-full">
              {stats.fallasPorCategoria.length > 0 ? (
                <Bar data={categoriasData} options={barOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-xs">Sin datos</div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6">
            <h3 className="text-zinc-300 font-mono text-sm uppercase tracking-widest mb-6 text-center">
              Propiedades por Tipo
            </h3>
            <div className="h-64 w-full">
              {stats.propiedadesPorTipo.length > 0 ? (
                <Doughnut data={propiedadesData} options={doughnutOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-xs">Sin datos</div>
              )}
            </div>
          </div>

          {/* Últimas Revisiones (Tabla) */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-col">
            <h3 className="text-zinc-300 font-mono text-sm uppercase tracking-widest mb-4 flex items-center justify-between">
              Últimas Revisiones
              <Link to="/revisiones" className="text-amber-500 hover:text-amber-400 text-xs normal-case tracking-normal underline">
                Ver todas
              </Link>
            </h3>
            <div className="flex-1 overflow-auto">
              {stats.ultimasRevisiones.length > 0 ? (
                <div className="space-y-3">
                  {stats.ultimasRevisiones.map((rev) => (
                    <Link 
                      key={rev.id} 
                      to={`/revisiones/${rev.id}`}
                      className="block bg-zinc-950 border border-zinc-800 p-3 hover:border-amber-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-zinc-200 font-mono text-sm font-bold truncate pr-2">
                          {rev.propiedad?.direccion || 'Sin dirección'}
                        </span>
                        <span className="text-zinc-500 font-mono text-xs whitespace-nowrap">
                          {formatDisplayDate(rev.fecha_revision)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="amber">{rev.categoria_observacion}</Badge>
                        <span className="text-zinc-500 text-xs font-mono">{rev.propiedad?.comuna}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-xs">Sin revisiones</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
