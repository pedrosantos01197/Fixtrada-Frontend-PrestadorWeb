import { Colors } from '@/theme/colors';
import { Check } from 'lucide-react';
import { AppText } from './AppText';
import { View } from './MobileWrappers';

interface Props {
  criteria: {
    length: boolean;
    uppercase?: boolean;
    lowercase?: boolean;
    specialChar?: boolean;
    match?: boolean;
  };
}

export function PasswordValidation({ criteria }: Props) {
  const items = [
    { label: 'Pelo menos 8 caracteres', ok: criteria.length },
    { label: 'Uma letra maiúscula', ok: !!criteria.uppercase },
    { label: 'Uma letra minúscula', ok: !!criteria.lowercase },
    { label: 'Um caractere especial (!@#$)', ok: !!criteria.specialChar },
    { label: 'As senhas coincidem', ok: !!criteria.match },
  ];

  return (
    <View style={{ gap: 6, marginTop: 8 }}>
      {items.map((item) => (
        <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Check size={16} color={item.ok ? Colors.success : Colors.gray} />
          <AppText style={{ color: item.ok ? Colors.success : Colors.darkGray }}>{item.label}</AppText>
        </View>
      ))}
    </View>
  );
}
