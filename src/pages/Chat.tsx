import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppText, TextInput, TouchableOpacity, View } from '@/components';
import { API_BASE_URL } from '@/config/ip';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/theme/colors';
import { Send, ChevronLeft } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { api } from '@/services/api';

// Define os tipos de mensagem
type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
};

export default function Chat() {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState('Chat');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!chatId || !user) {
      setLoading(false);
      return;
    }

    const socket = io(API_BASE_URL, {
      auth: { token: user?.token },
    });
    socketRef.current = socket;

    socket.emit('join_service_chat', chatId);

    socket.on('receive_message', (msg: any) => {
      const mapped: Message = {
        id: msg.menID || msg.id,
        senderId: msg.senderId || msg.fk_remetente_usuID || msg.sender,
        content: msg.content || msg.menConteudo,
        timestamp: msg.menData || msg.timestamp,
      };
      setMessages((prev) => [mapped, ...prev]);
    });

    const fetchChatDetails = async () => {
      try {
        const response = await api.get(`/chats/${chatId}/messages`);
        if (response.status === 200) {
          const messagesFromApi = response.data.messages || [];
          setMessages(messagesFromApi);
          setShopName(response.data.shopName || 'Chat');
        }
      } catch (error) {
        console.error('Erro ao buscar chat:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatDetails();

    return () => {
      socket.emit('leave_service_chat', chatId);
      socket.disconnect();
    };
  }, [chatId, user]);

  const handleSend = () => {
    if (newMessage.trim() === '' || !socketRef.current || !user) return;

    const messagePayload = {
      serviceId: chatId,
      senderId: user.id,
      senderName: user?.nome || user?.usuNome || user?.mecLogin || user?.name || user?.login,
      content: newMessage.trim(),
    };

    socketRef.current.emit('send_message', messagePayload);
    setNewMessage('');
  };

  return (
    <View style={{ flex: 1, minHeight: '100vh', backgroundColor: Colors.white }}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: Colors.background, borderBottom: `1px solid ${Colors.gray}` }}>
        <TouchableOpacity style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }} onPress={() => navigate(-1)}>
          <ChevronLeft size={24} color={Colors.primary} />
          <AppText style={{ color: Colors.primary, fontSize: 18, fontWeight: 500 }}>Voltar</AppText>
        </TouchableOpacity>
        <AppText style={{ fontSize: 20, fontWeight: 'bold', color: Colors.primary }}>{shopName}</AppText>
        <div style={{ width: 80 }} />
      </View>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 12, gap: 8 }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AppText>Carregando...</AppText>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: 8 }}>
            {messages.map((item) => {
              const isSender = item.senderId === user?.id;
              return (
                <div key={item.id} style={{ display: 'flex', justifyContent: isSender ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '10px 12px',
                      borderRadius: 16,
                      backgroundColor: isSender ? Colors.primary : Colors.gray,
                      color: isSender ? Colors.white : Colors.darkGray,
                    }}
                  >
                    <AppText style={{ color: isSender ? Colors.white : Colors.darkGray }}>{typeof item.content === 'string' ? item.content : String(item.content || '')}</AppText>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, borderTop: `1px solid ${Colors.gray}`, paddingTop: 8 }}>
          <TextInput
            style={{ flex: 1, minHeight: 40, maxHeight: 120, border: `2px solid ${Colors.primary}`, borderRadius: 20, padding: '10px 14px', fontSize: 16, backgroundColor: Colors.white }}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Digite sua mensagem..."
            multiline
          />
          <TouchableOpacity
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onPress={handleSend}
          >
            <Send size={22} color={Colors.white} />
          </TouchableOpacity>
        </div>
      </div>
    </View>
  );
}
