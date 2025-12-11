import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Briefcase, MessageCircle, User, Shield, FileText, LogOut } from 'lucide-react';

const navItems = [
  { path: '/Home', label: 'Início', icon: Home },
  { path: '/Servicos', label: 'Serviços', icon: Briefcase },
  { path: '/ChatList', label: 'Chats', icon: MessageCircle },
  { path: '/Perfil', label: 'Perfil', icon: User },
  { path: '/DadosPessoais', label: 'Dados Pessoais', icon: FileText },
  { path: '/Seguranca', label: 'Segurança', icon: Shield },
];

export function Header() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <h1>Fixtrada Prestador</h1>
        </div>

        <nav className="header-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="header-user">
          <span className="user-name">{user?.nome || user?.mecNome || user?.usuNome || 'Prestador'}</span>
          <button
            onClick={async () => {
              await signOut();
              navigate('/', { replace: true });
            }}
            className="logout-btn"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
