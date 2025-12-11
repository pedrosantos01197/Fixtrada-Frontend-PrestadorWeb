import React, { CSSProperties, ReactNode, useState } from 'react';

type Style = CSSProperties | Array<CSSProperties | undefined> | undefined;

function mergeStyles(style: Style): CSSProperties | undefined {
  if (!style) return undefined;
  if (Array.isArray(style)) {
    return style.reduce<CSSProperties>((acc, current) => ({ ...acc, ...(current || {}) }), {});
  }
  return style;
}

export const View: React.FC<{ style?: Style; children?: ReactNode } & React.HTMLAttributes<HTMLDivElement>> = ({
  style,
  children,
  ...rest
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', ...mergeStyles(style) }} {...rest}>
    {children}
  </div>
);

export const Text: React.FC<{ style?: Style; children?: ReactNode; onPress?: () => void; textAlign?: CSSProperties['textAlign']; fontWeight?: CSSProperties['fontWeight']; underline?: boolean } & React.HTMLAttributes<HTMLSpanElement>> = ({
  style,
  children,
  onPress,
  textAlign,
  fontWeight,
  underline,
  ...rest
}) => (
  <span
    style={{
      margin: 0,
      padding: 0,
      display: 'inline',
      textAlign,
      fontWeight,
      textDecoration: underline ? 'underline' : undefined,
      ...mergeStyles(style),
    }}
    onClick={onPress}
    {...rest}
  >
    {children}
  </span>
);

export const TouchableOpacity: React.FC<{
  style?: Style;
  children?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  activeOpacity?: number;
} & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  style,
  children,
  onPress,
  disabled,
  activeOpacity = 0.7,
  ...rest
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const merged = mergeStyles(style);
  const opacity = isPressed ? activeOpacity : merged?.opacity ?? 1;

  return (
    <button
      type="button"
      {...rest}
      onClick={onPress}
      disabled={disabled}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: 'transparent',
        border: 'none',
        padding: 0,
        transition: 'opacity 150ms ease',
        opacity,
        ...merged,
      }}
    >
      {children}
    </button>
  );
};

export const ScrollView: React.FC<{
  style?: Style;
  contentContainerStyle?: Style;
  children?: ReactNode;
}> = ({ style, contentContainerStyle, children }) => (
  <div style={{ overflowY: 'auto', width: '100%', ...mergeStyles(style) }}>
    <div style={{ display: 'flex', flexDirection: 'column', ...mergeStyles(contentContainerStyle) }}>
      {children}
    </div>
  </div>
);

type TextInputProps = {
  style?: Style;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  keyboardType?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export const TextInput: React.FC<TextInputProps & React.InputHTMLAttributes<HTMLInputElement>> = ({
  style,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  multiline,
  ...rest
}) => {
  const commonProps = {
    placeholder,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChangeText?.(e.target.value),
    style: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: 8,
      outline: 'none',
      ...mergeStyles(style),
    } as CSSProperties,
  };

  if (multiline) {
    return (
      <textarea
        {...(rest as any)}
        {...commonProps}
        rows={4}
      />
    );
  }

  return (
    <input
      {...rest}
      {...commonProps}
      type={secureTextEntry ? 'password' : rest.type || 'text'}
    />
  );
};
