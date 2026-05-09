import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-zinc-900">
      {/* Sidebar solo en desktop */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header solo en móvil */}
        <MobileHeader />

        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav solo en móvil */}
      <BottomNav />
    </div>
  );
}