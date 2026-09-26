import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, { container: string; text: string }> = {
  primary: { container: 'bg-primary', text: 'text-white' },
  secondary: { container: 'bg-background-card border border-border-main', text: 'text-text-main' },
  outline: { container: 'bg-transparent border border-primary', text: 'text-primary' },
  ghost: { container: 'bg-transparent', text: 'text-primary' },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  fullWidth = true,
}: ButtonProps): React.JSX.Element {
  const isDisabled = disabled || loading;
  const styles = VARIANT_STYLES[variant];
  const paddingY = size === 'lg' ? 'py-4' : 'py-3';

  return (
    <Pressable
      className={`${styles.container} ${paddingY} rounded-2xl items-center justify-center shadow-sm${
        fullWidth ? 'w-full' : 'px-6'
      } ${isDisabled ? 'opacity-50' : 'active:opacity-90'}`}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#3b72a6'} />
      ) : (
        <Text className={`font-bold text-base ${styles.text}`}>{label}</Text>
      )}
    </Pressable>
  );
}
