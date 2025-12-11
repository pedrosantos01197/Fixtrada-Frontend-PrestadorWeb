import { NavLink, useNavigate } from 'react-router-dom';
import { AppText, View, TouchableOpacity } from '@/components';
import { Colors } from '@/theme/colors';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Briefcase, MessageCircle, User, Shield, LogOut } from 'lucide-react';

type LinkItemProps = { to: string; label: string; icon: React.ReactNode };

function LinkItem({ to, label, icon }: LinkItemProps) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 12,
        color: isActive ? '#0b1221' : '#e7ecf7',
        background: isActive ? Colors.primary : 'transparent',
        border: `1px solid ${isActive ? Colors.primary : '#1f2a44'}`,
        boxShadow: isActive ? '0 10px 25px rgba(75, 163, 255, 0.25)' : 'none',
        transition: 'all 0.2s ease',
      })}
    >
      {icon}
      <span style={{ fontWeight: 600 }}>{label}</span>
    </NavLink>
  );
}

export function NavMenu() {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (!isAuthenticated) return null;

  return (
    <View
      style={{
        width: 260,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(21,32,57,0.9) 0%, rgba(12,18,32,0.95) 100%)',
        borderRight: '1px solid #1f2a44',
        padding: 18,
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
        backdropFilter: 'blur(10px)',
      }}
    >
      <AppText style={{ fontSize: 22, fontWeight: 'bold', color: Colors.white, marginBottom: 18 }}>
        Fixtrada Web
      </AppText>
      <View style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <LinkItem to="/Home" label="Início" icon={<Home size={18} color="inherit" />} />
        <LinkItem to="/Servicos" label="Serviços" icon={<Briefcase size={18} color="inherit" />} />
        <LinkItem to="/ChatList" label="Chats" icon={<MessageCircle size={18} color="inherit" />} />
        <LinkItem to="/Perfil" label="Perfil" icon={<User size={18} color="inherit" />} />
        <LinkItem to="/DadosPessoais" label="Dados Pessoais" icon={<User size={18} color="inherit" />} />
        <LinkItem to="/Seguranca" label="Segurança" icon={<Shield size={18} color="inherit" />} />
      </View>
      <TouchableOpacity
        style={{
          marginTop: 24,
          padding: '12px 14px',
          borderRadius: 12,
          background: 'linear-gradient(90deg, #ff5f6d, #ffc371)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
        onPress={handleLogout}
      >
        <LogOut size={18} color="#0b1221" />
        <AppText style={{ color: '#0b1221', fontWeight: 700, textAlign: 'center' }}>Sair</AppText>
      </TouchableOpacity>
    </View>
  );
}
