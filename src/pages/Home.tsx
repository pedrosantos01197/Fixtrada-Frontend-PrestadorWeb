import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppText, Button, ScrollView, Text, TouchableOpacity, View } from '@/components';
import { API_BASE_URL } from '@/config/ip';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/theme/colors';
import { formatDate, formatTime } from '@/utils/formatters';
import { AlertTriangle, Clock, MapPin, Navigation as NavigationIcon, Plus } from 'lucide-react';

// Helper to get geolocation using the browser API
async function getCurrentPosition(): Promise<GeolocationPosition | null> {
  if (!('geolocation' in navigator)) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

type ServiceItem = {
  regID: number;
  regData: string;
  regHora: string;
  regStatus: string;
  regLatitude?: number | string;
  regLongitude?: number | string;
  tipoServico?: {
    tseTipoProblema: string;
  };
  endereco?: {
    endLatitude?: string;
    endLongitude?: string;
  };
  chats?: Array<{
    chatID: number;
  }>;
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [myServices, setMyServices] = useState<ServiceItem[]>([]);

  const fetchMyServices = async () => {
    try {
      const token = user?.token;
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/prestador/servicos/meus`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data: ServiceItem[] = await response.json();
      setMyServices(data);
    } catch (error) {
      console.error('Erro ao buscar meus serviços:', error);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyServices();
    setRefreshing(false);
  };

  const handleOpenMaps = async (item: ServiceItem) => {
    const currentLocation = await getCurrentPosition();
    const prestadorLat = currentLocation?.coords.latitude;
    const prestadorLng = currentLocation?.coords.longitude;

    let serviceLat: number | undefined;
    let serviceLng: number | undefined;

    if (item.regLatitude !== undefined && item.regLongitude !== undefined) {
      serviceLat = typeof item.regLatitude === 'string' ? parseFloat(item.regLatitude) : item.regLatitude;
      serviceLng = typeof item.regLongitude === 'string' ? parseFloat(item.regLongitude) : item.regLongitude;
    }

    if ((!serviceLat || !serviceLng) && item.endereco?.endLatitude && item.endereco?.endLongitude) {
      serviceLat = typeof item.endereco.endLatitude === 'string' ? parseFloat(item.endereco.endLatitude) : item.endereco.endLatitude;
      serviceLng = typeof item.endereco.endLongitude === 'string' ? parseFloat(item.endereco.endLongitude) : item.endereco.endLongitude;
    }

    if (!serviceLat || !serviceLng || Number.isNaN(serviceLat) || Number.isNaN(serviceLng)) {
      window.alert('Localização do serviço não disponível.');
      return;
    }

    const origin = prestadorLat && prestadorLng ? `${prestadorLat},${prestadorLng}/` : '';
    const webUrl = `https://www.google.com/maps/dir/${origin}${serviceLat},${serviceLng}`;
    window.open(webUrl, '_blank');
  };

  const handleOpenChat = (item: ServiceItem) => {
    const chatID = item.chats?.[0]?.chatID;
    if (chatID) {
      navigate(`/Chat/${chatID}`);
    }
  };

  return (
    <View style={{ flex: 1, minHeight: '100vh', backgroundColor: Colors.background, padding: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <AppText style={{ fontSize: 22, fontWeight: 'bold', color: Colors.primary }}>Home</AppText>
        <Button title={refreshing ? 'Atualizando...' : 'Atualizar'} onPress={onRefresh} containerStyle={{ width: 160 }} disabled={refreshing} />
      </View>

      <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ gap: 16 }}>
        {myServices.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 32, color: Colors.gray }}>Nenhum serviço em andamento.</Text>
        ) : (
          myServices.slice(0, 1).map((item) => (
            <View key={item.regID} style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 20,
              width: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              display: 'flex',
              gap: 12,
            }}>
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={20} color={Colors.primary} />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.primary }}>
                  Problema: <Text style={{ fontWeight: 'bold', color: Colors.primary }}>{item.tipoServico?.tseTipoProblema || 'N/D'}</Text>
                </Text>
              </View>

              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Clock size={20} color={Colors.primary} />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.primary }}>
                  Data: <Text style={{ fontWeight: 'bold', color: Colors.primary }}>{formatDate(item.regData)} às {formatTime(item.regHora)}</Text>
                </Text>
              </View>

              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MapPin size={20} color={Colors.primary} />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.primary }}>
                  Status: <Text style={{ fontWeight: 'bold', color: Colors.primary }}>{item.regStatus || 'Em andamento'}</Text>
                </Text>
              </View>

              <View style={{ display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.primary,
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: Colors.white,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onPress={() => navigate(`/DetalhesServico/${item.regID}`)}
                >
                  <Plus size={20} color="white" />
                  <Text style={{ color: Colors.white, fontWeight: 'bold' }}>Detalhes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.primary,
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: Colors.white,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onPress={() => handleOpenMaps(item)}
                >
                  <NavigationIcon size={20} color="white" />
                  <Text style={{ color: Colors.white, fontWeight: 'bold' }}>Ir para Rota</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: item.chats?.[0]?.chatID ? Colors.primary : '#ccc',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: Colors.white,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onPress={() => handleOpenChat(item)}
                  disabled={!item.chats?.[0]?.chatID}
                >
                  <Text style={{ color: Colors.white, fontWeight: 'bold' }}>Abrir Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
