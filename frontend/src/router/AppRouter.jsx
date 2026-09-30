import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/shared/ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import PropiedadesPage from '../features/propiedades/PropiedadesPage';
import PropiedadForm from '../features/propiedades/PropiedadForm';
import PropiedadRevisiones from '../features/propiedades/PropiedadRevisiones';
import ClientesPage from '../features/clientes/ClientesPage';
import ClienteForm from '../features/clientes/ClienteForm';
import RevisionesPage from '../features/revisiones/RevisionesPage';
import RevisionForm from '../features/revisiones/RevisionForm';
import RevisionDetalle from '../features/revisiones/RevisionDetalle';
import InformePage from '../features/informes/InformePage';
import DashboardPage from '../features/dashboard/DashboardPage';
import PresupuestosPage from '../features/presupuestos/PresupuestosPage';
import PresupuestoForm from '../features/presupuestos/PresupuestoForm';
import PresupuestoDetalle from '../features/presupuestos/PresupuestoDetalle';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>

          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Propiedades */}
            <Route path="propiedades" element={<PropiedadesPage />} />
            <Route path="propiedades/nueva" element={<PropiedadForm />} />
            <Route path="propiedades/:id/editar" element={<PropiedadForm />} />
            {/* NUEVO: revisiones por propiedad */}
            <Route path="propiedades/:id/revisiones" element={<PropiedadRevisiones />} />

            {/* Clientes */}
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="clientes/nuevo" element={<ClienteForm />} />
            <Route path="clientes/:correo/editar" element={<ClienteForm />} />

            {/* Revisiones */}
            <Route path="revisiones" element={<RevisionesPage />} />
            <Route path="revisiones/nueva" element={<RevisionForm />} />
            <Route path="revisiones/:id" element={<RevisionDetalle />} />
            <Route path="revisiones/:id/informe" element={<InformePage />} />

            {/* Presupuestos e Itemizados Oficiales NCh 1156 */}
            <Route path="presupuestos" element={<PresupuestosPage />} />
            <Route path="presupuestos/nuevo" element={<PresupuestoForm />} />
            <Route path="presupuestos/:id" element={<PresupuestoDetalle />} />
            <Route path="presupuestos/:id/editar" element={<PresupuestoForm />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}