import { CSSProperties, ReactNode } from 'react';
import { Text } from './MobileWrappers';

interface Props {
  children: ReactNode;
  style?: CSSProperties | Array<CSSProperties | undefined>;
  textAlign?: CSSProperties['textAlign'];
  fontWeight?: CSSProperties['fontWeight'];
  underline?: boolean;
  onPress?: () => void;
}

export function AppText({ children, style, textAlign, fontWeight, underline, onPress }: Props) {
  return (
    <Text style={style as any} textAlign={textAlign} fontWeight={fontWeight} underline={underline} onPress={onPress}>
      {children}
    </Text>
  );
}
