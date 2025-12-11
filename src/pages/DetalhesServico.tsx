import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppText, Button, ScrollView, Text, TouchableOpacity, View } from '@/components';
import { API_BASE_URL } from '@/config/ip';
import { strings } from '@/languages';
import { Colors } from '@/theme/colors';
import { Car, ChevronLeft, Navigation as NavigationIcon, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const styles: Record<string, React.CSSProperties> = {
  container: { flex: 1, backgroundColor: Colors.background, minHeight: '100vh' },
  headerContainer: { position: 'sticky', top: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: Colors.background, zIndex: 5 },
  backButton: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, cursor: 'pointer' },
  scrollContentContainer: { padding: 16, paddingTop: 0, gap: 16 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, boxShadow: '0 4px 10px rgba(0,0,0,0.06)' },
  separator: { height: 6, backgroundColor: Colors.primary },
  orderBlock: { backgroundColor: Colors.primary, padding: '10px 16px', textAlign: 'center', color: Colors.white, fontWeight: 'bold', borderRadius: 0 },
  descriptionBox: { backgroundColor: Colors.background, borderRadius: 12, padding: 16, marginTop: 12, border: `1px solid ${Colors.primary}` },
  actionsRow: { display: 'flex', flexDirection: 'row', gap: 12, marginTop: 12 },
};

function formatDate(dateStr?: string) {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '' || !dateStr.includes('-')) return '-';
  try {
    const partes = dateStr.split('-');
    if (partes.length !== 3) return dateStr;
    const [year, month, day] = partes;
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  } catch {
    return '-';
  }
}

function formatCNPJ(cnpj?: string) {
  if (!cnpj) return '-';
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function translateStatus(status: string) {
  switch (status?.toLowerCase()) {
    case 'pendente':
      return 'Pendente';
    case 'proposta':
      return 'Proposta';
    case 'incompleto':
      return 'Incompleto';
    case 'finalizado':
      return 'Finalizado';
    case 'concluído':
      return 'Finalizado';
    case 'em_andamento':
    case 'em andamento':
      return 'Em Andamento';
    default:
      return status;
  }
}

async function getCurrentPosition(): Promise<GeolocationPosition | null> {
  if (!('geolocation' in navigator)) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

export default function DetalhesServico() {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { user } = useAuth();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = user?.token;
        if (!token) {
          setError('Usuário não autenticado.');
          setLoading(false);
          return;
        }
        const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Erro ao buscar detalhes do serviço');
        const data = await response.json();
        setService(data);
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    if (serviceId) fetchServiceDetails();
  }, [serviceId, user?.token]);

  const handleFinalizeService = async () => {
    if (!service) return;
    if (!window.confirm('Tem certeza que deseja finalizar este serviço?')) return;
    try {
      const token = user?.token;
      const response = await fetch(`${API_BASE_URL}/services/${service.id}/finalize`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (response.ok) {
        window.alert('Serviço finalizado com sucesso!');
        setService({ ...service, status: 'finalizado' });
      } else {
        window.alert('Erro ao finalizar serviço');
      }
    } catch (err) {
      window.alert('Erro ao finalizar serviço');
    }
  };

  const handleOpenChat = () => {
    if (!service) return;
    navigate(`/Chat/${service.id}`);
  };

  const handleOpenMaps = async () => {
    if (!service) return;
    try {
      const currentLocation = await getCurrentPosition();
      const prestadorLat = currentLocation?.coords.latitude;
      const prestadorLng = currentLocation?.coords.longitude;

      let serviceLat = service.latitude as unknown as number;
      let serviceLng = service.longitude as unknown as number;

      if (!serviceLat || !serviceLng || Number.isNaN(serviceLat) || Number.isNaN(serviceLng)) {
        window.alert('Localização do serviço não disponível.');
        return;
      }

      const origin = prestadorLat && prestadorLng ? `${prestadorLat},${prestadorLng}/` : '';
      const webUrl = `https://www.google.com/maps/dir/${origin}${serviceLat},${serviceLng}`;
      window.open(webUrl, '_blank');
    } catch (error) {
      window.alert('Não foi possível abrir o Google Maps.');
    }
  };

  if (loading) {
    return (
      <View style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AppText style={{ marginTop: 16 }}>Carregando detalhes...</AppText>
      </View>
    );
  }

  if (error || !service) {
    return (
      <View style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AppText style={{ color: Colors.secondary, textAlign: 'center' }}>{error || 'Serviço não encontrado'}</AppText>
        <Button title="Voltar" onPress={() => navigate(-1)} containerStyle={{ marginTop: 16, width: 160 }} />
      </View>
    );
  }

  const status = translateStatus(service.status);
  const statusLower = service.status?.toLowerCase();
  const showFinalizeButton = statusLower === 'em_andamento';

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigate(-1)}>
          <ChevronLeft size={28} color={Colors.primary} />
          <AppText style={{ color: Colors.primary, fontSize: 18, fontWeight: 500 }}>{strings.global.back}</AppText>
        </TouchableOpacity>
        {showFinalizeButton && (
          <Button
            title="Finalizar Serviço"
            onPress={handleFinalizeService}
            containerStyle={{ backgroundColor: Colors.error, padding: '10px 14px', borderRadius: 8, width: 'auto' }}
            textStyle={{ color: Colors.white, fontWeight: 'bold', fontSize: 14 }}
          />
        )}
      </View>

      <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={styles.scrollContentContainer}>
        <View style={{ ...styles.card, display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.lightGray, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${Colors.gray}` }}>
            <Car size={50} color={Colors.darkGray} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={{ fontSize: 20, fontWeight: 'bold', color: Colors.primary }}>
              {service.prestador?.mecLogin || 'Prestador não informado'}
            </AppText>
            <AppText style={{ fontSize: 14, color: Colors.darkGray }}>
              CNPJ: {formatCNPJ(service.prestador?.mecCNPJ)}
            </AppText>
            {service.prestador?.mecNota && (
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <AppText style={{ fontSize: 14, color: Colors.darkGray }}>
                  Nota: {service.prestador.mecNota.toFixed(1)}
                </AppText>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    color={Colors.gold}
                    fill={i < Math.floor(service.prestador?.mecNota || 0) ? Colors.gold : 'none'}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        <div style={styles.separator} />
        <div style={styles.orderBlock}>Ordem de serviço N° {service.codigo || 'Não informado'}</div>

        <View style={{ ...styles.card, gap: 8 }}>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Car size={30} color={Colors.secondary} />
            <AppText style={{ fontSize: 20, fontWeight: 'bold', color: Colors.primary }}>
              {service.carro?.carMarca} {service.carro?.carModelo} {service.carro?.carAno ? `(${service.carro.carAno})` : ''} - {service.carro?.carPlaca}
            </AppText>
          </View>
          <AppText>
            Tipo de serviço: <AppText style={{ fontWeight: 'bold' }}>{service.tipoServico?.tseTipoProblema || '-'}</AppText>
          </AppText>
          <AppText>
            Data: <AppText style={{ fontWeight: 'bold' }}>{formatDate(service.data)}</AppText>
          </AppText>
          <AppText>
            Status: <AppText style={{ fontWeight: 'bold', color: statusLower === 'pendente' || statusLower === 'em_andamento' ? Colors.secondary : Colors.primary }}>{status}</AppText>
          </AppText>
          <AppText>
            Valor: <AppText style={{ fontWeight: 'bold' }}>{service.valor ? `R$ ${Number(service.valor).toFixed(2).replace('.', ',')}` : 'Não informado'}</AppText>
          </AppText>
          {service.descricao && (
            <View style={styles.descriptionBox}>
              <AppText style={{ fontWeight: 'bold', color: Colors.primary, marginBottom: 6 }}>Descrição</AppText>
              <AppText style={{ lineHeight: 1.5 }}>{service.descricao}</AppText>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          <Button
            title="Ir para Rota"
            onPress={handleOpenMaps}
            containerStyle={{ flex: 1, height: 48, borderRadius: 10 }}
            textStyle={{ color: Colors.white, fontWeight: 'bold' }}
            icon={<NavigationIcon size={18} color={Colors.white} />}
          />
          <Button
            title="Abrir Chat"
            onPress={handleOpenChat}
            containerStyle={{ flex: 1, height: 48, borderRadius: 10 }}
            textStyle={{ color: Colors.white, fontWeight: 'bold' }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
