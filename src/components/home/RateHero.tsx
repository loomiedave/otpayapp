import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COUNTRIES, CountryCode } from '../../constants/countries';
import { formatUpdatedAt } from '../../lib/currency';
import { useTheme } from '../../contexts/ThemeContext';

interface RateHeroProps {
  from: CountryCode;
  to: CountryCode;
  rate: number;
  fee: number;
  updatedAt: string | null;
  onSwap: () => void;
}

function formatRateSmart(rate: number): string {
  if (rate === 0) return '0.00';
  if (rate < 1) return rate.toFixed(4);
  if (rate < 100) return rate.toFixed(2);
  return rate.toFixed(1);
}

export default function RateHero({ from, to, rate, fee, updatedAt, onSwap }: RateHeroProps): React.JSX.Element {
  const { isDark } = useTheme();

  return (
    <View
      className={
        isDark
          ? 'mx-6 rounded-[28px] px-6 py-9 bg-background-card-dark border border-border-main-dark'
          : 'mx-6 rounded-[28px] px-6 py-9 bg-background-card border border-border-main'
      }
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.3 : 0.06,
        shadowRadius: 16,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full mr-2 bg-accent" />
          <Text
            className={
              isDark
                ? 'text-text-muted-dark text-xs font-bold'
                : 'text-text-muted text-xs font-bold'
            }
            style={{ letterSpacing: 1.2 }}
          >
            LIVE RATE
          </Text>
        </View>
        <Text className={isDark ? 'text-text-muted-dark text-xs' : 'text-text-muted text-xs'}>
          {updatedAt ? formatUpdatedAt(updatedAt) : ''}
        </Text>
      </View>

      <View className="flex-row items-center justify-center mt-5">
        <View
          className={
            isDark
              ? 'flex-row items-center px-3 py-1.5 rounded-full bg-background-main-dark'
              : 'flex-row items-center px-3 py-1.5 rounded-full bg-background-main'
          }
        >
          <Text className="text-lg mr-1.5">{COUNTRIES[from].flag}</Text>
          <Text className={isDark ? 'text-text-main-dark font-bold text-sm' : 'text-text-main font-bold text-sm'}>
            {COUNTRIES[from].name}
          </Text>
        </View>

        <Pressable
          onPress={onSwap}
          className="mx-3 w-9 h-9 rounded-full items-center justify-center active:opacity-70 bg-accent"
        >
          {/* Fixed dark icon color, not theme-driven: the accent circle is bright yellow in both
              light and dark mode (a brand constant), so a theme-toggled icon color would lose
              contrast in dark mode. */}
          <Feather name="repeat" size={15} color="#1A1D24" />
        </Pressable>

        <View
          className={
            isDark
              ? 'flex-row items-center px-3 py-1.5 rounded-full bg-background-main-dark'
              : 'flex-row items-center px-3 py-1.5 rounded-full bg-background-main'
          }
        >
          <Text className="text-lg mr-1.5">{COUNTRIES[to].flag}</Text>
          <Text className={isDark ? 'text-text-main-dark font-bold text-sm' : 'text-text-main font-bold text-sm'}>
            {COUNTRIES[to].name}
          </Text>
        </View>
      </View>

      <Text
        className={
          isDark
            ? 'text-text-main-dark text-center mt-8'
            : 'text-text-main text-center mt-8'
        }
        style={{ fontSize: 40, fontWeight: '800', fontVariant: ['tabular-nums'] }}
      >
        {formatRateSmart(rate)}
      </Text>

      <Text className={isDark ? 'text-text-muted-dark text-sm text-center mt-3' : 'text-text-muted text-sm text-center mt-3'}>
        1000 {COUNTRIES[from].currency} equals {COUNTRIES[to].currency}
      </Text>

      <Text className={isDark ? 'text-text-muted-dark text-xs text-center mt-1.5' : 'text-text-muted text-xs text-center mt-1.5'}>
        {fee > 0 ? `Includes a ${fee} ${COUNTRIES[from].currency} fee` : 'No fee on this transfer'}
      </Text>
    </View>
  );
}
