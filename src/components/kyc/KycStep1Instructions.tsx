import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

interface KycStep1InstructionsProps {
  fullName: string;
  onContinue: () => void;
}

export default function KycStep1Instructions({ fullName, onContinue }: KycStep1InstructionsProps): React.JSX.Element {
  const { isDark } = useTheme();
  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark p-5'
    : 'rounded-2xl bg-background-card border border-border-main p-5';

  return (
    <View>
      <View className={`${cardClass} items-center`}>
        <View className="w-14 h-14 rounded-full bg-primary/10 items-center justify-center mb-4">
          <Feather name="alert-triangle" size={24} color="#f59e0b" />
        </View>
        <Text className={isDark ? 'text-text-main-dark font-bold text-base text-center mb-2' : 'text-text-main font-bold text-base text-center mb-2'}>
          Before you start
        </Text>
        <Text className={isDark ? 'text-text-muted-dark text-sm text-center leading-5 mb-3' : 'text-text-muted text-sm text-center leading-5 mb-3'}>
          Your document must show this exact name:
        </Text>
        <Text className={isDark ? 'text-text-main-dark font-bold text-lg text-center mb-3' : 'text-text-main font-bold text-lg text-center mb-3'}>
          {fullName}
        </Text>
        <Text className={isDark ? 'text-text-muted-dark text-xs text-center leading-5' : 'text-text-muted text-xs text-center leading-5'}>
          A different or misspelled name is the most common reason submissions are rejected. If this is wrong, contact support before continuing.
        </Text>
      </View>
      <View className="mt-6">
        <Button label="I understand, continue" onPress={onContinue} />
      </View>
    </View>
  );
}
