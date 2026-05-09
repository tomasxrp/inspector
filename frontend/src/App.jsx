import AppRouter from './router/AppRouter';
import { AuthProvider } from './store/authStore';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}