import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppText, AnimationProvider, AnimatedView, Button, Input, SquareIcon, useScreenAnimation, View, Text, TouchableOpacity, ScrollView, TextInput } from '@/components';
import { API_BASE_URL } from '@/config/ip';
import { useAuth } from '@/contexts/AuthContext';
import { strings } from '@/languages';
import { Colors } from '@/theme/colors';
import { FilterStatus } from '@/types/FilterStatus';

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: Colors.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 960,
    backgroundColor: Colors.white,
    borderRadius: 16,
    boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    overflow: 'hidden',
  },
  hero: {
    background: 'linear-gradient(180deg, #004aad, #3478f6)',
    color: Colors.white,
    padding: 32,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    padding: 32,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  form: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    gap: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: Colors.white,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    lineHeight: 1.5,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginBottom: 7,
    gap: 8,
  },
  checkboxContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  modalButtonsRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingBlock: 10,
    borderRadius: 8,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    border: 'none',
  },
  modalInput: {
    width: '100%',
    border: `2px solid ${Colors.primary}`,
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 16,
  },
};

function LoginContent() {
  const { signIn } = useAuth();
  const [passwordStatus, setPasswordStatus] = useState(FilterStatus.HIDE);
  const [checkboxStatus, setCheckboxStatus] = useState(FilterStatus.UNCHECKED);
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceCode, setServiceCode] = useState('');
  const { handleNavigatePush } = useScreenAnimation();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement | null>(null);

  function handleTogglePasswordVisibility() {
    setPasswordStatus((prevState) =>
      prevState === FilterStatus.HIDE ? FilterStatus.SHOW : FilterStatus.HIDE
    );
  }

  function handleToggleCheckbox() {
    setCheckboxStatus((currentStatus) =>
      currentStatus === FilterStatus.UNCHECKED
        ? FilterStatus.CHECKED
        : FilterStatus.UNCHECKED
    );
  }

  async function handleLogin() {
    try {
      const response = await fetch(`${API_BASE_URL}/prestador/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, senha }),
      });

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log('Resposta não-JSON do servidor:', text);
        data = { message: 'Erro ao processar login.' };
      }

      if (response.ok) {
        if (data.token && data.user) {
          await signIn({ ...data.user, token: data.token });
          handleNavigatePush('/Home', 'fadeOutUp');
        } else {
          window.alert('Token não recebido do servidor.');
        }
      } else {
        formRef.current?.classList.add('shake');
        window.alert(data.message || 'Erro ao fazer login.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      formRef.current?.classList.add('shake');
      window.alert(strings.global.serverError);
    }
  }

  async function handleSendCode() {
    if (!serviceCode.trim()) {
      window.alert('Por favor, insira um código de serviço válido.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/prestador/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoServico: serviceCode }),
      });

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log('Resposta não-JSON do servidor:', text);
        data = { message: 'Erro ao processar login.' };
      }

      if (response.ok) {
        if (data.token && data.user) {
          await signIn({ ...data.user, token: data.token });
          setModalVisible(false);
          setServiceCode('');
          handleNavigatePush('/Home', 'fadeOutUp');
        } else {
          window.alert('Token não recebido do servidor.');
        }
      } else {
        window.alert(data.message || 'Código inválido.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      window.alert(strings.global.serverError);
    }
  }

  return (
    <View style={styles.container}>
      {modalVisible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Insira o código de serviço</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: Colors.primary, fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </div>
            <TextInput
              style={styles.modalInput}
              placeholder="Código"
              value={serviceCode}
              onChangeText={setServiceCode}
            />
            <div style={styles.modalButtonsRow}>
              <button style={styles.modalButton as React.CSSProperties} onClick={() => console.log('Ler QR Code')}>
                Ler QR Code
              </button>
              <button style={styles.modalButton as React.CSSProperties} onClick={handleSendCode}>
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.hero}>
          <AppText style={styles.heroTitle}>Bem-vindo(a) à Fixtrada</AppText>
          <AppText style={styles.heroSub}>Conecte-se e gerencie os serviços com rapidez. Acesse com seu e-mail/senha ou código de serviço.</AppText>
          <Button title="Sou novo aqui" onPress={() => handleNavigatePush('/Cadastro', 'fadeOutUp')} containerStyle={{ backgroundColor: '#fff', color: Colors.primary, marginTop: 12 }} textStyle={{ color: Colors.primary, fontWeight: 700 }} />
        </div>
        <ScrollView style={{ width: '100%' }} contentContainerStyle={{ display: 'flex', justifyContent: 'center' }}>
          <View style={styles.content}>
            <div ref={formRef as any} style={{ ...styles.form }}>
              <AnimatedView>
                <Input
                  label={strings.global.emailLabel}
                  placeholder={strings.global.emailPlaceholder}
                  containerStyle={{ width: '100%' }}
                  value={login}
                  onChangeText={setLogin}
                />
              </AnimatedView>
              <AnimatedView>
                <Input
                  label={strings.global.passwordLabel}
                  placeholder={strings.login.passwordPlaceholder}
                  status={passwordStatus}
                  onEyeIconPress={handleTogglePasswordVisibility}
                  secureTextEntry={passwordStatus === FilterStatus.HIDE}
                  containerStyle={{ width: '100%' }}
                  value={senha}
                  onChangeText={setSenha}
                  type="password"
                />
              </AnimatedView>
              <AnimatedView style={styles.row}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={handleToggleCheckbox}
                >
                  <SquareIcon status={checkboxStatus} style={{ marginTop: 2 }} />
                  <AppText>{strings.login.rememberMe}</AppText>
                </TouchableOpacity>
                <AppText
                  onPress={() => navigate('/RecuperarCadastro')}
                  style={{ cursor: 'pointer' }}
                >
                  {strings.login.forgotPassword}
                </AppText>
              </AnimatedView>

              <AnimatedView style={{ marginBottom: 5, width: '100%', display: 'flex', alignItems: 'center' }}>
                <Button
                  title={strings.login.loginButton}
                  containerStyle={{ width: '100%' }}
                  onPress={handleLogin}
                />
              </AnimatedView>

              <AnimatedView style={{ marginTop: 6, width: '100%', display: 'flex', alignItems: 'center' }}>
                <Button
                  title="Entrar com código"
                  containerStyle={{ width: '100%', backgroundColor: Colors.gray }}
                  textStyle={{ color: Colors.darkGray }}
                  onPress={() => setModalVisible(true)}
                />
              </AnimatedView>

              <AnimatedView>
                <TouchableOpacity onPress={() => handleNavigatePush('/Cadastro', 'fadeOutUp')}>
                  <AppText>
                    {strings.login.noAccount}{' '}
                    <AppText fontWeight="800" underline>
                      {strings.login.signUp}
                    </AppText>
                  </AppText>
                </TouchableOpacity>
              </AnimatedView>
            </div>
          </View>
        </ScrollView>
      </div>
    </View>
  );
}

export default function Login() {
  return (
    <AnimationProvider>
      <LoginContent />
    </AnimationProvider>
  );
}
