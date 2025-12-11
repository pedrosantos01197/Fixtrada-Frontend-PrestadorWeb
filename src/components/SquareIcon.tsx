import { Colors } from '@/theme/colors';
import { FilterStatus } from '@/types/FilterStatus';
import { Check } from 'lucide-react';
import { View } from './MobileWrappers';

interface Props {
  status: FilterStatus;
  style?: React.CSSProperties;
}

export function SquareIcon({ status, style }: Props) {
  const checked = status === FilterStatus.CHECKED || status === FilterStatus.SELECTED;
  return (
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 4,
        border: `2px solid ${Colors.primary}`,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: checked ? Colors.primary : 'transparent',
        ...style,
      }}
    >
      {checked && <Check size={14} color={Colors.white} />}
    </View>
  );
}
