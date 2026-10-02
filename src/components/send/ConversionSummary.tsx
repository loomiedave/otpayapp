import React from 'react';
import { View, Text } from 'react-native';
import CountryFlag from 'react-native-country-flag';
import { formatRate } from '@/lib/currency';

interface ConversionSummaryProps {
  toCountry: string | null;
  fromCountry: string;
  convertedAmount: number;
  rate: number;
  fee: number;
  getCountry: (code: string) => { code: string; name: string; currency_code: string };
  isDark: boolean;
  t: (key: string, opts?: Record<string, unknown>) => string;
  cardClass: string;
}

export default function ConversionSummary({
  toCountry,
  fromCountry,
  convertedAmount,
  rate,
  fee,
  getCountry,
  isDark,
  t,
  cardClass,
}: ConversionSummaryProps): React.JSX.Element {
  return (
    <View className={`${cardClass} mt-4 p-4`}>
      <View className="flex-row items-center justify-between">
        <Text className={isDark ? 'text-text-muted-dark text-sm' : 'text-text-muted text-sm'}>{t('send.recipientGets')}</Text>
        {toCountry ? (
          <View className="flex-row items-center">
            <CountryFlag isoCode={toCountry} size={16} />
            <Text className={isDark ? 'text-text-main-dark font-semibold text-sm ml-1' : 'text-text-main font-semibold text-sm ml-1'}>
              {getCountry(toCountry).currency_code}
            </Text>
          </View>
        ) : (
          <Text className={isDark ? 'text-text-muted-dark text-sm' : 'text-text-muted text-sm'}>{t('send.selectRecipient')}</Text>
        )}
      </View>

      {toCountry && (
        <>
          <Text className={isDark ? 'text-text-main-dark font-bold mt-2' : 'text-text-main font-bold mt-2'} style={{ fontSize: 28 }}>
            {formatRate(convertedAmount)}
          </Text>
          <Text className={isDark ? 'text-text-muted-dark text-xs mt-1' : 'text-text-muted text-xs mt-1'}>
            1 {getCountry(fromCountry).currency_code} = {formatRate(rate)} {getCountry(toCountry).currency_code}
            {fee > 0
              ? `  ·  ${t('send.fee', { fee, currency: getCountry(fromCountry).currency_code })}`
              : `  ·  ${t('send.noFee')}`}
          </Text>
        </>
      )}
    </View>
  );
}
