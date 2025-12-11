import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppText, Button, ScrollView, Text, TextInput, TouchableOpacity, View } from '@/components';
import { API_BASE_URL } from '@/config/ip';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/theme/colors';
import { formatDate, formatTime } from '@/utils/formatters';
import { AlertTriangle, Clock, MapPin, Navigation as NavigationIcon, Plus, X } from 'lucide-react';

async function getCurrentPosition(): Promise<GeolocationPosition | null> {
  if (!('geolocation' in navigator)) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

// --- TIPO DE DADOS ---
type ServiceItem = {
  regID: string;
  regData?: string;
  regHora?: string;
  regStatus?: string;
  regDescricao?: string | null;
  regValorVisita?: number | string | null;
  regValorEstimado?: number | string | null;
  regLatitude?: number | string;
  regLongitude?: number | string;
  fk_carro_carID?: string;
  fk_tipoServico_tseID?: string;
  fk_usuario_usuID?: string;
  tipoServico?: {
    tseID: string;
    tseTipoProblema: string;
  };
  carro?: {
    carID: string;
    carPlaca: string;
    carMarca: string;
    carModelo: string;
    carAno: number;
    carCor: string;
    carKM: number;
    carTpCombust?: string;
    usuario?: {
      usuID: string;
      usuNome: string;
      usuTelefone?: string;
    };
  };
  endereco?: {
    endCEP: string;
    endRua: string;
    endBairro: string;
    endCidade: string;
    endEstado: string;
    endLatitude?: string | number;
    endLongitude?: string | number;
  };
  chats?: Array<{
    chatID: string;
  }>;
};

const styles: Record<string, React.CSSProperties> = {
  container: { flex: 1, backgroundColor: Colors.background, minHeight: '100vh', padding: 16 },
  header: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  tabs: { display: 'flex', flexDirection: 'row', gap: 12, marginTop: 12 },
  tab: { flex: 1, padding: '10px 12px', textAlign: 'center', borderRadius: 10, border: `2px solid ${Colors.primary}`, cursor: 'pointer' },
  tabActive: { backgroundColor: Colors.primary, color: Colors.white },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: 16 },
  infoRow: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  detailsButton: { backgroundColor: Colors.primary, borderRadius: 10, padding: '10px 14px', color: Colors.white, display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer' },
  actionButtonsContainer: { width: '100%', display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 12 },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '90%', maxWidth: 520, position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 },
  closeButton: { position: 'absolute', top: 12, right: 12, cursor: 'pointer' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, textAlign: 'center' },
  bulletList: { display: 'flex', flexDirection: 'column', gap: 4 },
  bulletItem: { fontSize: 15, fontWeight: 'bold', color: Colors.primary },
  addressText: { fontSize: 14, color: Colors.primary, lineHeight: 1.4 },
  distanceText: { fontSize: 15, fontWeight: 'bold', color: Colors.secondary },
  modalActionButton: { width: '100%', backgroundColor: Colors.primary, color: Colors.white, borderRadius: 12, padding: '12px 14px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  inputWrapper: { width: '100%', marginTop: 12 },
  inputLabelCustom: { fontSize: 14, fontWeight: 'bold', color: Colors.primary, marginBottom: 6 },
  inputCustom: { width: '100%', height: 48, border: `2px solid ${Colors.primary}`, borderRadius: 12, paddingInline: 12, fontSize: 16, fontWeight: 'bold', color: Colors.primary },
};

export default function Servicos() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [myServices, setMyServices] = useState<ServiceItem[]>([]);
  const [activeTab, setActiveTab] = useState<'disponíveis' | 'meus'>('disponíveis');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para modais
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState('');
  const [serviceDistance, setServiceDistance] = useState<string | null>(null);

  const formatCurrency = useCallback((value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    const numberValue = parseInt(numericValue, 10);
    return (numberValue / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }, []);

  const handleEstimatedValueChange = (text: string) => {
    const formatted = formatCurrency(text);
    setEstimatedValue(formatted);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getCoordinatesFromCEP = async (cep: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) return null;
      const address = `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}, Brasil`;
      const nominatimResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const nominatimData = await nominatimResponse.json();
      if (nominatimData.length > 0) {
        return { lat: parseFloat(nominatimData[0].lat), lon: parseFloat(nominatimData[0].lon) };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      return null;
    }
  };

  const calculateServiceDistance = async (cep: string) => {
    try {
      const location = await getCurrentPosition();
      if (!location) {
        setServiceDistance('Permissão de localização negada');
        return;
      }

      const currentLat = location.coords.latitude;
      const currentLon = location.coords.longitude;
      const serviceCoords = await getCoordinatesFromCEP(cep);
      if (!serviceCoords) {
        setServiceDistance('Não foi possível calcular a distância');
        return;
      }

      const distance = calculateDistance(currentLat, currentLon, serviceCoords.lat, serviceCoords.lon);
      if (distance < 1) {
        setServiceDistance(`${Math.round(distance * 1000)}m`);
      } else {
        setServiceDistance(`${distance.toFixed(1)}km`);
      }
    } catch (error) {
      console.error('Erro ao calcular distância:', error);
      setServiceDistance('Erro ao calcular distância');
    }
  };

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = user?.token;
      if (!token) {
        setError('Usuário não autenticado.');
        setServices([]);
        setMyServices([]);
        setLoading(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/prestador/servicos/disponiveis`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao buscar serviços');
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar serviços');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const fetchMyServices = useCallback(async () => {
    try {
      const token = user?.token;
      if (!token) {
        setMyServices([]);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/prestador/servicos/meus`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao buscar meus serviços');
      const data = await response.json();
      setMyServices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Erro ao buscar meus serviços:', err);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchServices();
    fetchMyServices();
  }, [fetchServices, fetchMyServices]);

  useEffect(() => {
    if (activeTab === 'meus') fetchMyServices();
  }, [activeTab, fetchMyServices]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'disponíveis') {
      await fetchServices();
    } else {
      await fetchMyServices();
    }
    setRefreshing(false);
  }, [fetchServices, fetchMyServices, activeTab]);

  const handleOpenDetails = (service: ServiceItem) => {
    setSelectedService(service);
    setServiceDistance(null);
    setDetailsModalVisible(true);
    if (service.endereco?.endCEP) {
      calculateServiceDistance(service.endereco.endCEP);
    }
  };

  const handleOpenOffer = () => {
    setDetailsModalVisible(false);
    setTimeout(() => setOfferModalVisible(true), 150);
  };

  const handleSendOffer = async () => {
    if (!selectedService || !estimatedValue) return;
    try {
      const token = user?.token;
      if (!token) return;

      const valorNumerico = parseFloat(estimatedValue.replace(/[^\d,]/g, '').replace(',', '.'));
      if (Number.isNaN(valorNumerico) || valorNumerico <= 0) return;

      const response = await fetch(`${API_BASE_URL}/prestador/servicos/${selectedService.regID}/proposta`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ valor: valorNumerico }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar proposta');
      }

      setOfferModalVisible(false);
      setEstimatedValue('');
      await fetchServices();
    } catch (err: any) {
      console.error('Erro ao enviar proposta:', err.message);
    }
  };

  const handleOpenMaps = async (service: ServiceItem) => {
    try {
      const currentLocation = await getCurrentPosition();
      const prestadorLat = currentLocation?.coords.latitude;
      const prestadorLng = currentLocation?.coords.longitude;

      let serviceLat: number | undefined;
      let serviceLng: number | undefined;

      if (service.regLatitude !== undefined && service.regLongitude !== undefined) {
        serviceLat = typeof service.regLatitude === 'string' ? parseFloat(service.regLatitude) : service.regLatitude;
        serviceLng = typeof service.regLongitude === 'string' ? parseFloat(service.regLongitude) : service.regLongitude;
      }

      if ((!serviceLat || !serviceLng) && service.endereco?.endLatitude && service.endereco?.endLongitude) {
        serviceLat = typeof service.endereco.endLatitude === 'string' ? parseFloat(service.endereco.endLatitude) : service.endereco.endLatitude;
        serviceLng = typeof service.endereco.endLongitude === 'string' ? parseFloat(service.endereco.endLongitude) : service.endereco.endLongitude;
      }

      if ((!serviceLat || !serviceLng) && service.endereco?.endCEP) {
        const coords = await getCoordinatesFromCEP(service.endereco.endCEP);
        if (coords) {
          serviceLat = coords.lat;
          serviceLng = coords.lon;
        }
      }

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

  const handleOpenChat = (service: ServiceItem) => {
    const chatId = service.chats?.[0]?.chatID;
    if (chatId) {
      navigate(`/Chat/${chatId}`);
    }
  };

  const renderCardActions = (item: ServiceItem) => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity
        style={{ ...styles.detailsButton, display: 'flex', alignItems: 'center' }}
        onPress={() => navigate(`/DetalhesServico/${item.regID}`)}
      >
        <Plus size={20} color="white" />
        <Text style={{ color: Colors.white, fontWeight: 'bold' }}>Detalhes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ ...styles.detailsButton, display: 'flex', alignItems: 'center' }}
        onPress={() => handleOpenMaps(item)}
      >
        <NavigationIcon size={20} color="white" />
        <Text style={{ color: Colors.white, fontWeight: 'bold' }}>Ir para Rota</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          ...styles.detailsButton,
          backgroundColor: item.chats?.[0]?.chatID ? Colors.primary : '#ccc',
          display: 'flex',
          alignItems: 'center',
        }}
        onPress={() => handleOpenChat(item)}
        disabled={!item.chats?.[0]?.chatID}
      >
        <Text style={{ color: Colors.white, fontWeight: 'bold' }}>Abrir Chat</Text>
      </TouchableOpacity>
    </View>
  );

  const renderServiceCard = (item: ServiceItem, showDetailsButton = true) => (
    <View key={item.regID} style={styles.card}>
      <View style={styles.infoRow}>
        <AlertTriangle size={20} color={Colors.primary} />
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.primary }}>
          Problema: <Text style={{ fontWeight: 'bold', color: Colors.primary }}>{item.tipoServico?.tseTipoProblema || 'N/D'}</Text>
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Clock size={20} color={Colors.primary} />
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.primary }}>
          Data: <Text style={{ fontWeight: 'bold', color: Colors.primary }}>{formatDate(item.regData || '')} às {formatTime(item.regHora || '')}</Text>
        </Text>
      </View>
      <View style={styles.infoRow}>
        <MapPin size={20} color={Colors.primary} />
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.primary }}>
          Status: <Text style={{ fontWeight: 'bold', color: Colors.primary }}>{item.regStatus || 'Pendente'}</Text>
        </Text>
      </View>
      {showDetailsButton ? (
        <TouchableOpacity style={styles.detailsButton} onPress={() => handleOpenDetails(item)}>
          <Text style={{ color: Colors.white, fontWeight: 'bold' }}>Exibir Detalhes +</Text>
        </TouchableOpacity>
      ) : (
        renderCardActions(item)
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText style={{ fontSize: 22, fontWeight: 'bold', color: Colors.primary }}>Serviços</AppText>
        <Button title={refreshing ? 'Atualizando...' : 'Atualizar'} onPress={onRefresh} containerStyle={{ width: 160 }} disabled={refreshing} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={{ ...styles.tab, ...(activeTab === 'disponíveis' ? styles.tabActive : {}) }}
          onPress={() => setActiveTab('disponíveis')}
        >
          <Text style={{ color: activeTab === 'disponíveis' ? Colors.white : Colors.primary, fontWeight: 'bold' }}>Disponíveis</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ ...styles.tab, ...(activeTab === 'meus' ? styles.tabActive : {}) }}
          onPress={() => setActiveTab('meus')}
        >
          <Text style={{ color: activeTab === 'meus' ? Colors.white : Colors.primary, fontWeight: 'bold' }}>Meus Serviços</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, width: '100%', marginTop: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {activeTab === 'disponíveis' ? (
          loading ? (
            <AppText style={{ textAlign: 'center', marginTop: 32 }}>Carregando...</AppText>
          ) : error ? (
            <AppText style={{ color: Colors.secondary, textAlign: 'center', marginTop: 32 }}>{error}</AppText>
          ) : services.length === 0 ? (
            <AppText style={{ textAlign: 'center', marginTop: 32 }}>Nenhum serviço disponível.</AppText>
          ) : (
            services.map((item) => renderServiceCard(item, true))
          )
        ) : myServices.length === 0 ? (
          <AppText style={{ textAlign: 'center', marginTop: 32 }}>Nenhum serviço em andamento.</AppText>
        ) : (
          myServices.map((item) => renderServiceCard(item, false))
        )}
      </ScrollView>

      {detailsModalVisible && selectedService && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.closeButton as React.CSSProperties} onClick={() => setDetailsModalVisible(false)}>
              <X size={24} color={Colors.primary} />
            </div>
            <Text style={styles.modalTitle}>{selectedService.tipoServico?.tseTipoProblema || 'Serviço Disponível'}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.primary }}>
              Descrição: <Text style={{ fontWeight: 'normal' }}>{selectedService.regDescricao || 'Sem descrição'}</Text>
            </Text>
            {selectedService.carro && (
              <div style={styles.bulletList}>
                <Text style={styles.bulletItem}>• Modelo: {selectedService.carro.carModelo}</Text>
                <Text style={styles.bulletItem}>• Marca: {selectedService.carro.carMarca}</Text>
                <Text style={styles.bulletItem}>• Ano: {selectedService.carro.carAno}</Text>
                <Text style={styles.bulletItem}>• Quilometragem: {selectedService.carro.carKM.toLocaleString('pt-BR')}</Text>
                <Text style={styles.bulletItem}>• Tipo de Combustível: {selectedService.carro.carTpCombust || 'N/D'}</Text>
                <Text style={styles.bulletItem}>• Cor: {selectedService.carro.carCor}</Text>
              </div>
            )}
            {selectedService.endereco && (
              <>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.primary }}>Endereço:</Text>
                <Text style={styles.addressText}>
                  {selectedService.endereco.endRua}, {selectedService.endereco.endBairro}, {selectedService.endereco.endCidade} - {selectedService.endereco.endEstado}, CEP: {selectedService.endereco.endCEP}
                </Text>
                {serviceDistance && <Text style={styles.distanceText}>Distância: {serviceDistance}</Text>}
              </>
            )}
            <button style={styles.modalActionButton as React.CSSProperties} onClick={handleOpenOffer}>Oferta de Valor</button>
          </div>
        </div>
      )}

      {offerModalVisible && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.closeButton as React.CSSProperties} onClick={() => setOfferModalVisible(false)}>
              <X size={24} color={Colors.primary} />
            </div>
            <div style={styles.inputWrapper}>
              <Text style={styles.inputLabelCustom}>Valor Estimado</Text>
              <TextInput
                style={styles.inputCustom}
                placeholder="R$ 0,00"
                value={estimatedValue}
                onChangeText={handleEstimatedValueChange}
              />
            </div>
            <button style={styles.modalActionButton as React.CSSProperties} onClick={handleSendOffer}>Enviar</button>
          </div>
        </div>
      )}
    </View>
  );
}
