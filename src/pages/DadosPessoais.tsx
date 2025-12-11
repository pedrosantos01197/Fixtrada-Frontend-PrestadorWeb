import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppText, Button, Input, TouchableOpacity, View } from '@/components';
import { API_BASE_URL } from '@/config/ip';
import { useAuth } from '@/contexts/AuthContext';
import { strings } from '@/languages';
import { Colors } from '@/theme/colors';
import { formatPhoneNumber, unformatPhoneNumber } from '@/utils/formatters';
import { storage } from '@/lib/storage';

type FieldKey = 'nome' | 'email' | 'telefone';

export default function DadosPessoais() {
  const navigate = useNavigate();
  const { reloadUser } = useAuth();

  const [initialData, setInitialData] = useState({ nome: '', email: '', telefone: '' });
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState<FieldKey | null>(null);
  const [modalValue, setModalValue] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = await storage.getItem('userToken');
      setToken(storedToken);
      const raw = await storage.getItem('userData');
      if (!raw) {
        setInitialData({ nome: '', email: '', telefone: '' });
        setNome('');
        setEmail('');
        setTelefone('');
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        const next = {
          nome: parsed.nome || '',
          email: parsed.email || parsed.login || '',
          telefone: parsed.telefone || '',
        };
        setInitialData(next);
        setNome(next.nome);
        setEmail(next.email);
        setTelefone(next.telefone ? formatPhoneNumber(next.telefone) : '');
      } catch (err) {
        console.error('Erro ao parsear userData', err);
      }
    };
    loadUser();
  }, []);

  const hasChanges = useMemo(() => {
    return (
      nome !== initialData.nome ||
      email !== initialData.email ||
      unformatPhoneNumber(telefone) !== (initialData.telefone || '')
    );
  }, [nome, email, telefone, initialData]);

  const openModal = (field: FieldKey, value: string) => {
    setCurrentField(field);
    setModalValue(value);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentField(null);
    setModalValue('');
  };

  const applyModalValue = () => {
    if (!currentField) return;
    if (currentField === 'nome') setNome(modalValue);
    if (currentField === 'email') setEmail(modalValue);
    if (currentField === 'telefone') setTelefone(formatPhoneNumber(modalValue));
    closeModal();
  };

  const handleSave = async () => {
    const payload: Partial<{ nome: string; email: string; telefone: string }> = {};
    if (nome !== initialData.nome) payload.nome = nome;
    if (email !== initialData.email) payload.email = email;
    const rawTel = unformatPhoneNumber(telefone);
    if (rawTel !== (initialData.telefone || '')) payload.telefone = rawTel;

    if (!hasChanges) {
      window.alert(strings.personalDataScreen.noChanges);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cliente/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({ message: 'Erro ao atualizar.' }));

      if (response.ok) {
        window.alert(strings.personalDataScreen.updateSuccess);
        const updated = {
          ...initialData,
          ...payload,
          telefone: payload.telefone ?? initialData.telefone,
        };
        setInitialData(updated);
        await storage.setItem('userData', JSON.stringify(updated));
        await reloadUser();
      } else {
        window.alert(data.message || strings.personalDataScreen.updateError);
      }
    } catch (err) {
      console.error('Erro ao salvar dados', err);
      window.alert(strings.personalDataScreen.networkError);
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
          {strings.personalDataScreen.title}
        </AppText>
      </View>

      <View style={{ width: '100%', maxWidth: 720, marginTop: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        <View style={{ position: 'relative' }}>
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
              {nome ? nome.charAt(0).toUpperCase() : '?'}
            </AppText>
          </View>
        </View>

        <View style={{ width: '100%', display: 'flex', gap: 16 }}>
          <TouchableOpacity
            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}
            onPress={() => openModal('nome', nome)}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <AppText style={{ fontSize: 14, color: Colors.primary }}>{strings.personalDataScreen.name}</AppText>
              <AppText style={{ fontSize: 16, fontWeight: 500, color: Colors.darkGray, textAlign: 'center' }}>{nome}</AppText>
            </View>
            <AppText style={{ color: Colors.gray }}>›</AppText>
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: Colors.gray }} />

          <TouchableOpacity
            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}
            onPress={() => openModal('email', email)}
          >
            <View style={{ flex: 1, marginRight: 12, display: 'flex', alignItems: 'center' }}>
              <AppText style={{ fontSize: 14, color: Colors.primary }}>{strings.global.emailLabel}</AppText>
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppText style={{ fontSize: 16, fontWeight: 500, color: Colors.darkGray }}>{email}</AppText>
              </View>
            </View>
            <AppText style={{ color: Colors.gray }}>›</AppText>
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: Colors.gray }} />

          <TouchableOpacity
            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}
            onPress={() => openModal('telefone', telefone)}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <AppText style={{ fontSize: 14, color: Colors.primary }}>{strings.global.cellphoneLabel}</AppText>
              <AppText style={{ fontSize: 16, fontWeight: 500, color: Colors.darkGray, textAlign: 'center' }}>{telefone}</AppText>
            </View>
            <AppText style={{ color: Colors.gray }}>›</AppText>
          </TouchableOpacity>
        </View>

        <Button
          title={strings.personalDataScreen.saveChanges}
          onPress={handleSave}
          disabled={!hasChanges}
          containerStyle={{ width: '100%', maxWidth: 400, marginTop: 12 }}
        />
      </View>

      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              width: '90%',
              maxWidth: 420,
              backgroundColor: Colors.white,
              padding: 24,
              borderRadius: 12,
              boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <AppText style={{ fontSize: 18, fontWeight: 'bold', color: Colors.primary, textAlign: 'center' }}>
              {currentField === 'nome' ? strings.personalDataScreen.name : currentField === 'email' ? strings.global.emailLabel : strings.global.cellphoneLabel}
            </AppText>
            <Input
              containerStyle={{ width: '100%' }}
              value={modalValue}
              onChangeText={setModalValue}
              type={currentField === 'telefone' ? 'cellphone' : 'text'}
            />
            <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
              <Button title={strings.global.cancel} onPress={closeModal} containerStyle={{ flex: 1, backgroundColor: Colors.gray }} textStyle={{ color: Colors.darkGray }} />
              <Button title={strings.global.save} onPress={applyModalValue} containerStyle={{ flex: 1 }} />
            </View>
          </div>
        </div>
      )}
    </View>
  );
}
