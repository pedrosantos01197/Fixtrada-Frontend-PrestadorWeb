import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppText, Button, Input, View } from '@/components';
import { Colors } from '@/theme/colors';
import { API_BASE_URL } from '@/config/ip';
import { useAuth } from '@/contexts/AuthContext';

type FormState = {
  mecNome: string;
  mecCNPJ: string;
  mecLogin: string;
  mecSenha: string;
  mecEnderecoNum: string;
  latitude: string;
  longitude: string;
  endCEP: string;
  endRua: string;
  endBairro: string;
  endCidade: string;
  endEstado: string;
};

const initialState: FormState = {
  mecNome: '',
  mecCNPJ: '',
  mecLogin: '',
  mecSenha: '',
  mecEnderecoNum: '',
  latitude: '',
  longitude: '',
  endCEP: '',
  endRua: '',
  endBairro: '',
  endCidade: '',
  endEstado: '',
};

export default function Cadastro() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);

  const allRequiredFilled = useMemo(() => {
    const required = ['mecNome', 'mecCNPJ', 'mecLogin', 'mecSenha', 'mecEnderecoNum', 'latitude', 'longitude', 'endCEP', 'endRua', 'endBairro', 'endCidade', 'endEstado'] as const;
    return required.every((key) => String(form[key]).trim().length > 0);
  }, [form]);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateField('latitude', pos.coords.latitude.toString());
        updateField('longitude', pos.coords.longitude.toString());
      },
      (err) => {
        console.error('Erro ao obter localização', err);
        window.alert('Não foi possível obter localização automática.');
      }
    );
  };

  const handleSubmit = async () => {
    if (!allRequiredFilled) {
      window.alert('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        mecNome: form.mecNome,
        mecCNPJ: form.mecCNPJ.replace(/\D/g, ''),
        mecLogin: form.mecLogin,
        mecSenha: form.mecSenha,
        mecEnderecoNum: Number(form.mecEnderecoNum),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        endereco: {
          endCEP: form.endCEP.replace(/\D/g, ''),
          endRua: form.endRua,
          endBairro: form.endBairro,
          endCidade: form.endCidade,
          endEstado: form.endEstado,
        },
      };

      const response = await fetch(`${API_BASE_URL}/prestador/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({ message: 'Erro ao cadastrar.' }));

      if (response.ok) {
        window.alert(data.message || 'Cadastro realizado com sucesso!');
        if (data.token && data.user) {
          await signIn({ ...data.user, token: data.token });
          navigate('/Home', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        window.alert(data.message || 'Erro ao cadastrar.');
      }
    } catch (err) {
      console.error('Erro no cadastro', err);
      window.alert('Falha ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', backgroundColor: Colors.background, padding: '24px' }}>
      <View style={{ width: '100%', maxWidth: 900, backgroundColor: Colors.white, borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.08)', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <AppText style={{ fontSize: 24, fontWeight: 700, color: Colors.primary }}>Cadastro de Prestador</AppText>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <Input label="Nome" value={form.mecNome} onChangeText={(v) => updateField('mecNome', v)} />
          <Input label="CNPJ" value={form.mecCNPJ} onChangeText={(v) => updateField('mecCNPJ', v)} type="cnpj" />
          <Input label="E-mail" value={form.mecLogin} onChangeText={(v) => updateField('mecLogin', v)} type="email" />
          <Input label="Senha" value={form.mecSenha} onChangeText={(v) => updateField('mecSenha', v)} type="password" />
          <Input label="CEP" value={form.endCEP} onChangeText={(v) => updateField('endCEP', v)} type="cep" />
          <Input label="Rua" value={form.endRua} onChangeText={(v) => updateField('endRua', v)} />
          <Input label="Bairro" value={form.endBairro} onChangeText={(v) => updateField('endBairro', v)} />
          <Input label="Cidade" value={form.endCidade} onChangeText={(v) => updateField('endCidade', v)} />
          <Input label="UF" value={form.endEstado} onChangeText={(v) => updateField('endEstado', v)} />
          <Input label="Número" value={form.mecEnderecoNum} onChangeText={(v) => updateField('mecEnderecoNum', v)} />
          <Input label="Latitude" value={form.latitude} onChangeText={(v) => updateField('latitude', v)} />
          <Input label="Longitude" value={form.longitude} onChangeText={(v) => updateField('longitude', v)} />
        </div>
        <View style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button title="Usar minha localização" onPress={handleGeolocate} containerStyle={{ width: 220 }} />
          <Button title="Já tenho conta" onPress={() => navigate('/')} containerStyle={{ width: 180, backgroundColor: Colors.gray }} textStyle={{ color: Colors.darkGray }} />
        </View>
        <Button title={loading ? 'Enviando...' : 'Cadastrar'} onPress={handleSubmit} disabled={loading || !allRequiredFilled} containerStyle={{ width: '100%' }} />
      </View>
    </View>
  );
}
