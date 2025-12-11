import { View, AppText, Button } from '@/components';
import { Colors } from '@/theme/colors';
import { useNavigate } from 'react-router-dom';

export default function RecuperarCadastro() {
  const navigate = useNavigate();

  return (
    <View style={{ flex: 1, minHeight: '100vh', backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <AppText style={{ fontSize: 22, color: Colors.primary, textAlign: 'center', maxWidth: 400 }}>
        Recuperar cadastro ainda não está implementado na versão web.
      </AppText>
      <Button title="Voltar" onPress={() => navigate('/')} containerStyle={{ width: 200 }} />
    </View>
  );
}
