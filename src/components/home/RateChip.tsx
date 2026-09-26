import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CURRENCIES, CurrencyCode } from '../../constants/currencies';
import { formatRate } from '../../lib/currency';
import { useTheme } from '../../contexts/ThemeContext';

interface RateChipProps {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
}

export default function RateChip({ from, to, rate }: RateChipProps): React.JSX.Element {
  const { isDark } = useTheme();
  const fromInfo = CURRENCIES[from];
  const toInfo = CURRENCIES[to];

  return (
    <View
      className={
        isDark
          ? 'w-[48%] rounded-2xl p-4 bg-background-card-dark border border-border-main-dark mb-3'
          : 'w-[48%] rounded-2xl p-4 bg-background-card border border-border-main mb-3'
      }
    >
      <View className="flex-row items-center mb-3">
        <Text className="text-base">{fromInfo.flag}</Text>
        <Feather
          name="arrow-right"
          size={12}
          color={isDark ? '#64748b' : '#94a3b8'}
          style={{ marginHorizontal: 6 }}
        />
        <Text className="text-base">{toInfo.flag}</Text>
      </View>

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-1' : 'text-text-muted text-xs mb-1'}>
        1 {from} equals
      </Text>
      <Text className={isDark ? 'text-text-main-dark text-xl font-bold' : 'text-text-main text-xl font-bold'}>
        {formatRate(rate)} {to}
      </Text>
    </View>
  );
}
