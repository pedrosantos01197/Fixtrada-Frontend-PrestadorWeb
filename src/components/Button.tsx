import { CSSProperties, ReactNode } from 'react';
import { Colors } from '@/theme/colors';
import { TouchableOpacity, View, Text } from './MobileWrappers';

interface Props {
  title: string;
  onPress?: () => void;
  containerStyle?: CSSProperties;
  textStyle?: CSSProperties;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right' | 'top';
  disabled?: boolean;
}

export function Button({ title, onPress, containerStyle, textStyle, icon, iconPosition = 'left', disabled }: Props) {
  const isTop = iconPosition === 'top';
  const isRight = iconPosition === 'right';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        width: '100%',
        backgroundColor: disabled ? '#ccc' : Colors.primary,
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: isTop ? 'column' : 'row',
        gap: 8,
        ...containerStyle,
      }}
    >
      {icon && !isRight && <View style={{ marginBottom: isTop ? 4 : 0 }}>{icon}</View>}
      <Text style={{ color: Colors.white, fontWeight: 700, fontSize: 16, ...textStyle }}>{title}</Text>
      {icon && isRight && <View>{icon}</View>}
    </TouchableOpacity>
  );
}
