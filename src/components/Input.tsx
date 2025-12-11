import { CSSProperties, useMemo, useState } from 'react';
import { Colors } from '@/theme/colors';
import { FilterStatus } from '@/types/FilterStatus';
import { formatPhoneNumber, unformatPhoneNumber, formatCNPJ, unformatCNPJ, formatCEP, unformatCEP } from '@/utils/formatters';
import { Text, TextInput, TouchableOpacity, View } from './MobileWrappers';
import { Eye, EyeOff } from 'lucide-react';

type InputType = 'text' | 'email' | 'password' | 'cellphone' | 'cpf' | 'cnpj' | 'cep';

interface Props {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  status?: FilterStatus;
  onEyeIconPress?: () => void;
  containerStyle?: CSSProperties;
  keyboardType?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  type?: InputType;
  onPasswordChange?: (data: { text: string; criteria: any }) => void;
}

function maskValue(type: InputType | undefined, text: string) {
  if (type === 'cellphone') return formatPhoneNumber(text);
  if (type === 'cnpj') return formatCNPJ(text);
  if (type === 'cep') return formatCEP(text);
  return text;
}

export function Input({
  label,
  placeholder,
  value = '',
  onChangeText,
  secureTextEntry,
  status,
  onEyeIconPress,
  containerStyle,
  type = 'text',
  onPasswordChange,
}: Props) {
  const [internalValue, setInternalValue] = useState(value);
  const isPassword = type === 'password' || secureTextEntry || status === FilterStatus.HIDE || status === FilterStatus.SHOW;

  const criteria = useMemo(() => {
    const length = internalValue.length >= 8;
    const uppercase = /[A-Z]/.test(internalValue);
    const lowercase = /[a-z]/.test(internalValue);
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(internalValue);
    return { length, uppercase, lowercase, specialChar };
  }, [internalValue]);

  const handleChange = (text: string) => {
    const next = maskValue(type, text);
    setInternalValue(next);
    if (onChangeText) {
      const raw =
        type === 'cellphone'
          ? unformatPhoneNumber(next)
          : type === 'cnpj'
          ? unformatCNPJ(next)
          : type === 'cep'
          ? unformatCEP(next)
          : next;
      onChangeText(raw);
    }
    if (isPassword && onPasswordChange) {
      onPasswordChange({ text: next, criteria: { ...criteria } });
    }
  };

  const showText = status === FilterStatus.SHOW;
  const inputType = isPassword && !showText ? 'password' : type === 'email' ? 'email' : 'text';

  return (
    <View style={{ width: '100%', gap: 6, ...containerStyle }}>
      {label && <Text style={{ fontWeight: 600, color: Colors.darkGray }}>{label}</Text>}
      <View style={{ position: 'relative', width: '100%' }}>
        <TextInput
          placeholder={placeholder}
          value={internalValue}
          onChangeText={handleChange}
          secureTextEntry={inputType === 'password'}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: `2px solid ${Colors.primary}`,
            fontSize: 16,
            backgroundColor: Colors.white,
          }}
          type={inputType}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={onEyeIconPress || (() => {})}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
          >
            {showText ? <Eye color={Colors.primary} size={20} /> : <EyeOff color={Colors.primary} size={20} />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
