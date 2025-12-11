import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components';
import { View } from '@/components/MobileWrappers';

export function AppLayout() {
  const location = useLocation();
  const isAuthFree = ['/', '/Cadastro', '/RecuperarCadastro'].includes(location.pathname);

  if (isAuthFree) {
    return <Outlet />;
  }

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
