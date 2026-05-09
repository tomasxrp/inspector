import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

export default function ProtectedRoute() {
  const { auth } = useAuth();
  return auth?.token ? <Outlet /> : <Navigate to="/login" replace />;
}