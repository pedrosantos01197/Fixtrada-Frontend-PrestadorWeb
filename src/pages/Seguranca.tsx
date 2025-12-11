import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppText, Button, Input, PasswordValidation, TouchableOpacity, View } from '@/components';
import { API_BASE_URL } from '@/config/ip';
import { useAuth } from '@/contexts/AuthContext';
import { strings } from '@/languages';
import { Colors } from '@/theme/colors';
import { FilterStatus } from '@/types/FilterStatus';

export default function Seguranca() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [passwordModal, setPasswordModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [cpfModal, setCpfModal] = useState(false);
  const [cpf, setCpf] = useState('');

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(FilterStatus.HIDE);
  const [passwordCriteria, setPasswordCriteria] = useState({ length: false, uppercase: false, lowercase: false, specialChar: false, match: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const match = novaSenha.length > 0 && novaSenha === confirmarSenha;
    setPasswordCriteria((prev) => ({ ...prev, match }));
  }, [novaSenha, confirmarSenha]);

  const passwordValid = useMemo(() => {
    const { length, uppercase, specialChar, match } = passwordCriteria;
    return length && uppercase && specialChar && match;
  }, [passwordCriteria]);

  const togglePasswordVisibility = () => {
    setPasswordVisibility((s) => (s === FilterStatus.HIDE ? FilterStatus.SHOW : FilterStatus.HIDE));
  };

  const resetPasswordState = () => {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    setPasswordCriteria({ length: false, uppercase: false, lowercase: false, specialChar: false, match: false });
  };

  const handleChangePassword = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      window.alert(strings.global.fillAllFields);
      return;
    }
    if (!passwordValid) {
      window.alert(strings.cadastroCliente.passwordRequirements);
      return;
    }
    if (!user?.email) {
      window.alert('E-mail do usuário não encontrado.');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/password/change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          role: user.role || 'prestador',
          senhaAtual,
          novaSenha,
        }),
      });

      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json') ? await response.json() : { message: await response.text() };

      if (response.ok) {
        window.alert(data.message || 'Senha alterada com sucesso!');
        setPasswordModal(false);
        resetPasswordState();
      } else {
        window.alert(data.message || 'Erro ao alterar senha.');
      }
    } catch (err) {
      console.error('Erro ao alterar senha', err);
      window.alert(strings.global.serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        minHeight: '100vh',
        backgroundColor: Colors.background,
        padding: 24,
        alignItems: 'center',
      }}
    >
      <View style={{ width: '100%', maxWidth: 720, position: 'relative' }}>
        <TouchableOpacity onPress={() => navigate(-1)} style={{ position: 'absolute', left: 0, top: 0 }}>
          <AppText style={{ color: Colors.primary, fontWeight: 'bold' }}>◀</AppText>
        </TouchableOpacity>
        <AppText style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: Colors.primary }}>
          {strings.securityScreen.title}
        </AppText>
      </View>

      <View style={{ width: '100%', maxWidth: 720, marginTop: 32, display: 'flex', gap: 16 }}>
        <TouchableOpacity
          style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}
          onPress={() => setPasswordModal(true)}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <AppText style={{ fontSize: 16, fontWeight: 500, color: Colors.primary }}>{strings.securityScreen.password}</AppText>
            <AppText style={{ fontSize: 14, color: Colors.gray }}>{strings.securityScreen.passwordSubtitle}</AppText>
          </View>
          <AppText style={{ color: Colors.gray }}>›</AppText>
        </TouchableOpacity>
        <View style={{ height: 1, backgroundColor: Colors.gray }} />

        <TouchableOpacity
          style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}
          onPress={() => setDeleteModal(true)}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <AppText style={{ fontSize: 16, fontWeight: 500, color: 'red' }}>{strings.securityScreen.deleteAccount}</AppText>
            <AppText style={{ fontSize: 14, color: Colors.gray }}>{strings.securityScreen.deleteAccountWarning}</AppText>
          </View>
        </TouchableOpacity>
      </View>

      {passwordModal && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={() => { setPasswordModal(false); resetPasswordState(); }}
        >
          <div
            style={{ width: '90%', maxWidth: 520, backgroundColor: Colors.white, padding: 24, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.18)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <AppText style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primary, textAlign: 'center' }}>
              {strings.securityScreen.changePasswordTitle}
            </AppText>

            <Input
              containerStyle={{ width: '100%' }}
              placeholder={strings.securityScreen.currentPassword}
              value={senhaAtual}
              onChangeText={setSenhaAtual}
              status={passwordVisibility}
              onEyeIconPress={togglePasswordVisibility}
              secureTextEntry={passwordVisibility === FilterStatus.HIDE}
            />
            <Input
              containerStyle={{ width: '100%' }}
              placeholder={strings.securityScreen.newPassword}
              type="password"
              status={passwordVisibility}
              onEyeIconPress={togglePasswordVisibility}
              secureTextEntry={passwordVisibility === FilterStatus.HIDE}
              onPasswordChange={({ text, criteria }) => {
                setNovaSenha(text);
                setPasswordCriteria((prev) => ({ ...prev, ...criteria }));
              }}
            />
            <PasswordValidation criteria={passwordCriteria} />
            <Input
              containerStyle={{ width: '100%' }}
              placeholder={strings.securityScreen.confirmNewPassword}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              status={passwordVisibility}
              onEyeIconPress={togglePasswordVisibility}
              secureTextEntry={passwordVisibility === FilterStatus.HIDE}
            />
            <Button title={loading ? 'Salvando...' : strings.global.save} onPress={handleChangePassword} disabled={loading} containerStyle={{ width: '100%', marginTop: 6 }} />
          </div>
        </div>
      )}

      {deleteModal && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={() => setDeleteModal(false)}
        >
          <div
            style={{ width: '90%', maxWidth: 420, backgroundColor: Colors.white, padding: 24, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 12px 30px rgba(0,0,0,0.18)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <AppText style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primary, textAlign: 'center' }}>
              {strings.securityScreen.deleteAccountModalTitle}
            </AppText>
            <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
              <Button title={strings.securityScreen.no} onPress={() => setDeleteModal(false)} containerStyle={{ flex: 1, backgroundColor: Colors.gray }} textStyle={{ color: Colors.darkGray }} />
              <Button title={strings.securityScreen.yes} onPress={() => { setDeleteModal(false); setCpfModal(true); }} containerStyle={{ flex: 1, backgroundColor: 'red' }} />
            </View>
          </div>
        </div>
      )}

      {cpfModal && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={() => setCpfModal(false)}
        >
          <div
            style={{ width: '90%', maxWidth: 420, backgroundColor: Colors.white, padding: 24, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 12px 30px rgba(0,0,0,0.18)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <AppText style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primary, textAlign: 'center' }}>
              {strings.securityScreen.cpfModalTitle}
            </AppText>
            <Input containerStyle={{ width: '100%' }} placeholder={strings.global.cpfPlaceholder} value={cpf} onChangeText={setCpf} />
            <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
              <Button title={strings.global.cancel} onPress={() => setCpfModal(false)} containerStyle={{ flex: 1, backgroundColor: Colors.gray }} textStyle={{ color: Colors.darkGray }} />
              <Button title={strings.securityScreen.send} onPress={() => { window.alert('Envio de CPF ainda não implementado'); setCpfModal(false); }} containerStyle={{ flex: 1 }} />
            </View>
          </div>
        </div>
      )}
    </View>
  );
}
