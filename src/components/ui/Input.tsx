import React, { forwardRef, useRef, useState } from 'react';
import { View, Text, TextInput, TextInputProps, Pressable, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Feather.glyphMap;
  error?: string;
  hint?: string;
  secureToggle?: boolean;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
}

const Input = forwardRef<TextInput, InputProps>(
  ({ label, icon, error, hint, secureToggle, leftAccessory, rightAccessory, secureTextEntry, ...inputProps }, ref) => {
    const [hidden, setHidden] = useState<boolean>(!!secureTextEntry);
    const innerRef = useRef<TextInput>(null);
    const { isDark } = useTheme();
    const colors = useThemeColors();

    const toggleHidden = () => {
      setHidden((h) => !h);
      requestAnimationFrame(() => innerRef.current?.focus());
    };

    return (
      <View className="mb-4">
        {label && (
          <Text
            className={
              isDark
                ? 'text-sm font-medium mb-1 text-text-muted-dark'
                : 'text-sm font-medium mb-1 text-text-muted'
            }
          >
            {label}
          </Text>
        )}

        <View
          className="flex-row items-center px-3 rounded-md border"
          style={{
            borderColor: error ? colors.danger : colors.borderMain,
          }}
        >
          {leftAccessory}
          {icon && !leftAccessory && (
            <Feather name={icon} size={18} color={colors.iconMuted} style={{ marginRight: 8 }} />
          )}

          <TextInput
            key={secureToggle ? String(hidden) : undefined}
            ref={(node) => {
              innerRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
            }}
            className={isDark ? 'flex-1 text-text-main-dark' : 'flex-1 text-text-main'}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
            underlineColorAndroid="transparent"
            textAlignVertical="center"
            secureTextEntry={secureToggle ? hidden : secureTextEntry}
            {...inputProps}
            style={[
              { flex: 1, minWidth: 0 },
              Platform.OS === 'android'
                ? { padding: 0, includeFontPadding: false, paddingVertical: 12 }
                : { paddingVertical: 12 },
              inputProps.style,
            ]}
          />

          {secureToggle && (
            <Pressable onPress={toggleHidden} hitSlop={10} style={{ marginLeft: 8, zIndex: 1 }}>
              <Feather name={hidden ? 'eye-off' : 'eye'} size={18} color={colors.iconMuted} />
            </Pressable>
          )}
          {rightAccessory}
        </View>

        {error ? (
          <Text className="text-xs mt-1.5 ml-1" style={{ color: colors.danger }}>
            {error}
          </Text>
        ) : hint ? (
          <Text
            className={isDark ? 'text-text-muted-dark text-xs mt-1.5 ml-1' : 'text-text-muted text-xs mt-1.5 ml-1'}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';
export default Input;
