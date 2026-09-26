import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import ScreenContainer from '@/components/ui/ScreenContainer';
import HomeHeader from '@/components/home/HomeHeader';
import RateHero from '@/components/home/RateHero';
import RateTicker from '@/components/home/RateTicker';
import QuickActionsRow from '@/components/home/QuickActionsRow';
import PromoCarousel from '@/components/home/PromoCarousel';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { CountryCode } from '@/constants/countries';
import RecentTransactions from '@/components/home/RecentTransactions';

export default function HomeScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { session } = useAuth();
  const [from, setFrom] = useState<CountryCode>('GH');
  const [to, setTo] = useState<CountryCode>('NG');
  const { rates, loading } = useExchangeRates();

  const metadata = session?.user?.user_metadata as { first_name?: string } | undefined;
  const userName = metadata?.first_name ?? 'there';

  const selected = rates.find((r) => r.from === from && r.to === to);
  const tickerRates = rates.filter((r) => !(r.from === from && r.to === to));

  const handleSwap = (): void => {
    setFrom(to);
    setTo(from);
  };
  const handleSelectPair = (nextFrom: CountryCode, nextTo: CountryCode): void => {
    setFrom(nextFrom);
    setTo(nextTo);
  };

  if (loading) {
    return (
      <ScreenContainer paddingHorizontal={false} edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll paddingHorizontal={false} extraBottomPadding={32} edges={['top']}>
      <HomeHeader userName={userName} />
      <RateHero
        from={from}
        to={to}
        rate={selected?.rate ?? 0}
        fee={selected?.fee ?? 0}
        updatedAt={selected?.updated_at ?? null}
        onSwap={handleSwap}
      />
      <View className="mt-4">
        <RateTicker rates={tickerRates} onSelect={handleSelectPair} />
      </View>
      <View className="mt-6">
        <PromoCarousel />
      </View>
      <View className="mt-8">
        <Text
          className={
            isDark
              ? 'text-text-main-dark font-bold text-lg mb-4 px-6'
              : 'text-text-main font-bold text-lg mb-4 px-6'
          }
        >
          Quick Actions
        </Text>
        <QuickActionsRow />
      </View>
      <View className="mt-8 mb-4">
        <RecentTransactions />
      </View>
    </ScreenContainer>
  );
}
