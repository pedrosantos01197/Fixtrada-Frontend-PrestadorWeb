import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { View } from './MobileWrappers';

export const AnimationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const AnimatedView: React.FC<{ children: ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  return <View style={style}>{children}</View>;
};

export function useScreenAnimation() {
  const navigate = useNavigate();

  function handleNavigatePush(path: string, _animation?: string) {
    navigate(path);
  }

  return { handleNavigatePush };
}
