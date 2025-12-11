import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppText, Button, View } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { strings } from '@/languages';
import { Colors } from '@/theme/colors';

export default function Perfil() {
  const navigate = useNavigate();
  const { user, isAuthenticated, reloadUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [displayEmail, setDisplayEmail] = useState('');

  useEffect(() => {
    reloadUser();
  }, [isAuthenticated]);

  useEffect(() => {
    setDisplayName(user?.nome || user?.mecNome || user?.usuNome || '');
    setDisplayEmail(user?.email || user?.mecLogin || user?.usuLogin || '');
  }, [user]);

  return (
    <View
      style={{
        flex: 1,
        minHeight: '100vh',
        backgroundColor: Colors.background,
        alignItems: 'center',
        padding: 24,
        gap: 20,
      }}
    >
      <View style={{ width: '100%', maxWidth: 720, display: 'flex', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: Colors.gray,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText style={{ fontSize: 42, color: Colors.white }}>
            {displayName ? displayName.charAt(0).toUpperCase() : '?'}
          </AppText>
        </View>
        <AppText style={{ fontSize: 22, fontWeight: 'bold', color: Colors.darkGray, textAlign: 'center' }}>
          {displayName}
        </AppText>
        <AppText style={{ fontSize: 16, color: Colors.primary, textAlign: 'center' }}>
          {displayEmail}
        </AppText>
        <View style={{ height: 1, backgroundColor: Colors.gray, width: '80%', marginTop: 8 }} />
      </View>

      <View style={{ width: '100%', maxWidth: 720, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          title={strings.profile.personalData}
          onPress={() => navigate('/DadosPessoais')}
          containerStyle={{
            width: 240,
            height: 120,
            backgroundColor: Colors.background,
            border: `2px solid ${Colors.primary}`,
            padding: 12,
          }}
          textStyle={{ color: Colors.primary, fontSize: 16, textAlign: 'center' }}
        />
        <Button
          title={strings.profile.security}
          onPress={() => navigate('/Seguranca')}
          containerStyle={{
            width: 240,
            height: 120,
            backgroundColor: Colors.background,
            border: `2px solid ${Colors.primary}`,
            padding: 12,
          }}
          textStyle={{ color: Colors.primary, fontSize: 16, textAlign: 'center' }}
        />
      </View>
    </View>
  );
}
