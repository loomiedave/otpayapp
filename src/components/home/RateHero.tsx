import React, { useEffect, useRef, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { View, Text, Pressable, Animated } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

import { COUNTRIES, CountryCode } from '@/constants/countries';

import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const spin = useRef(new Animated.Value(0)).current;
  const turns = useRef(0);

  const handlePress = (): void => {
    turns.current += 1;
    Animated.spring(spin, { toValue: turns.current, useNativeDriver: true, friction: 6 }).start();
    onSwap();
  };
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  const pillClass = isDark
    ? 'flex-row items-center px-3 py-1.5 rounded-full bg-background-main-dark'
    : 'flex-row items-center px-3 py-1.5 rounded-full bg-background-main';
  const pillTextClass = isDark ? 'text-text-main-dark font-bold text-sm' : 'text-text-main font-bold text-sm';
  const mutedXs = isDark ? 'text-text-muted-dark text-xs' : 'text-text-muted text-xs';

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
          <Text className={`${mutedXs} font-bold`} style={{ letterSpacing: 1.2 }}>
            {t('home.live_rate')}
          </Text>
        </View>
        <Text className={mutedXs}>
          {now.toLocaleString(i18n.language, {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <View className="flex-row items-center justify-center mt-5">
        <View className={pillClass}>
          <Text className="text-lg mr-1.5">{COUNTRIES[from].flag}</Text>
          <Text className={pillTextClass}>{COUNTRIES[from].name}</Text>
        </View>

        <Pressable
          onPress={handlePress}
          hitSlop={8}
          className={
            isDark
              ? 'mx-3 w-9 h-9 rounded-full items-center justify-center border border-border-main-dark bg-background-card-dark active:opacity-70'
              : 'mx-3 w-9 h-9 rounded-full items-center justify-center border border-border-main bg-background-card active:opacity-70'
          }
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Feather name="repeat" size={16} color={isDark ? '#F5F5F5' : '#1A1D24'} />
          </Animated.View>
        </Pressable>

        <View className={pillClass}>
          <Text className="text-lg mr-1.5">{COUNTRIES[to].flag}</Text>
          <Text className={pillTextClass}>{COUNTRIES[to].name}</Text>
        </View>
      </View>

      <Text
        className={isDark ? 'text-text-main-dark text-center mt-8' : 'text-text-main text-center mt-8'}
        style={{ fontSize: 40, fontWeight: '800', fontVariant: ['tabular-nums'] }}
      >
        {formatRateSmart(rate)}
      </Text>

      <Text className={`${mutedXs.replace('text-xs', 'text-sm')} text-center mt-3`}>
        {t('home.rate_line', {
          amount: (1000).toLocaleString(),
          from: COUNTRIES[from].currency,
          converted: (1000 * rate).toLocaleString(undefined, { maximumFractionDigits: 2 }),
          to: COUNTRIES[to].currency,
        })}
      </Text>

      <Text className={`${mutedXs} text-center mt-1.5`}>
        {fee > 0 ? `${t('status.fee')} : ${fee} ${COUNTRIES[from].currency}` : t('home.no_fee_transfer')}
      </Text>
    </View>
  );
}
