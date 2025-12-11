import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppText, Button, TouchableOpacity, View } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { strings } from '@/languages';
import { Colors } from '@/theme/colors';
import { MessageSquare } from 'lucide-react';
import { api } from '@/services/api';

import '@/index.css';

type ChatSummary = {
  id: string;
  shopName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  logo?: any;
};

export default function ChatList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chats, setChats] = useState<ChatSummary[] | null>(null);

  const fetchChats = async () => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/cliente/meus-chats');
      setChats(response.data);
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChats();
    setRefreshing(false);
  }, [user]);

  const handleChatPress = (item: ChatSummary) => {
    navigate(`/Chat/${item.id}`);
  };

  const renderChatItem = (item: ChatSummary) => (
    <TouchableOpacity
      key={item.id}
      style={{
        display: 'flex',
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottom: `1px solid ${Colors.gray}`,
        backgroundColor: Colors.white,
        marginInline: 16,
        borderRadius: 12,
        marginBottom: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
      onPress={() => handleChatPress(item)}
    >
      <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <MessageSquare size={24} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText style={{ fontSize: 16, fontWeight: 'bold', color: Colors.primary }}>{item.shopName}</AppText>
        <AppText style={{ fontSize: 14, color: Colors.primary, opacity: 0.8 }}>
          {item.lastMessage}
        </AppText>
      </View>
      <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
        <AppText style={{ fontSize: 12, color: Colors.primary, opacity: 0.7 }}>{item.timestamp}</AppText>
        {item.unreadCount > 0 && (
          <View style={{ backgroundColor: Colors.primary, borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingInline: 5 }}>
            <AppText style={{ color: Colors.white, fontSize: 12, fontWeight: 'bold' }}>{item.unreadCount}</AppText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyOrLoading = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <AppText>Carregando...</AppText>
        </View>
      );
    }
    if (chats?.length === 0) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <AppText style={{ fontSize: 18, color: Colors.primary, fontWeight: 500 }}>
            {strings.chatsScreen.noActiveChats}
          </AppText>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={{ flex: 1, minHeight: '100vh', backgroundColor: Colors.background }}>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: `1px solid ${Colors.gray}`, backgroundColor: Colors.background }}>
        <AppText style={{ fontSize: 22, fontWeight: 'bold', color: Colors.primary }}>{strings.drawerMenu.chat}</AppText>
        <Button title={refreshing ? 'Atualizando...' : 'Atualizar'} onPress={onRefresh} containerStyle={{ width: 160 }} disabled={refreshing} />
      </View>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {chats && chats.length > 0 ? chats.map(renderChatItem) : renderEmptyOrLoading()}
      </div>
    </View>
  );
}
