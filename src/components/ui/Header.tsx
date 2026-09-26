import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  onBackPress?: () => void;
}

export default function Header({ title, showBack = true, rightElement, onBackPress }: HeaderProps): React.JSX.Element {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center justify-between py-4">
      {showBack ? (
        <Pressable
          className="w-10 h-10 rounded-full bg-background-card border border-border-main items-center justify-center"
          onPress={onBackPress ?? (() => router.back())}
        >
          <Feather name="chevron-left" size={20} color={colors.textMain} />
        </Pressable>
      ) : (
        <View className="w-10" />
      )}

      {title && <Text className="text-text-main font-bold text-lg">{title}</Text>}

      {rightElement ?? <View className="w-10" />}
    </View>
  );
}
