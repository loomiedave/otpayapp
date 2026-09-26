import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColors } from '@/hooks/useThemeColors';

interface KycStepIndicatorProps {
  step: 1 | 2 | 3;
}

const LABELS = ['Instructions', 'Documents', 'Selfie'];

export default function KycStepIndicator({ step }: KycStepIndicatorProps): React.JSX.Element {
  const { isDark } = useTheme();
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center justify-between mb-6">
      {LABELS.map((label, index) => {
        const stepNumber = index + 1;
        const active = stepNumber === step;
        const done = stepNumber < step;
        return (
          <View key={label} className="flex-1 items-center">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mb-1"
              style={{ backgroundColor: active || done ? colors.primary : isDark ? '#1e293b' : '#e2e8f0' }}
            >
              <Text className="text-xs font-bold" style={{ color: active || done ? '#fff' : isDark ? '#94a3b8' : '#64748b' }}>
                {stepNumber}
              </Text>
            </View>
            <Text className="text-[10px]" style={{ color: active ? colors.primary : isDark ? '#94a3b8' : '#64748b' }}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
