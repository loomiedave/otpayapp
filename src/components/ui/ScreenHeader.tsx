import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ScreenHeaderProps {
  title: string;
}

export default function ScreenHeader({ title }: ScreenHeaderProps): React.JSX.Element {
  const { isDark } = useTheme();
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center px-6 pt-2 pb-4">
      <Pressable
        onPress={() => router.back()}
        className={
          isDark
            ? 'w-9 h-9 rounded-full bg-background-card-dark items-center justify-center mr-3'
            : 'w-9 h-9 rounded-full bg-background-card items-center justify-center mr-3'
        }
      >
        <Feather name="chevron-left" size={20} color={colors.primary} />
      </Pressable>
      <Text className={isDark ? 'text-text-main-dark font-bold text-xl' : 'text-text-main font-bold text-xl'}>
        {title}
      </Text>
    </View>
  );
}
