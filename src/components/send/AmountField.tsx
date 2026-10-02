import React from 'react';
import { View, Text, Pressable } from 'react-native';
import CountryFlag from 'react-native-country-flag';
import Input from '../ui/Input';

interface AmountFieldProps {
  amount: string;
  onChangeAmount: (value: string) => void;
  fromCountry: string;
  onCycleFromCountry: () => void;
  getCountry: (code: string) => { code: string; name: string; currency_code: string };
  isDark: boolean;
  t: (key: string) => string;
}

export default function AmountField({
  amount,
  onChangeAmount,
  fromCountry,
  onCycleFromCountry,
  getCountry,
  isDark,
  t,
}: AmountFieldProps): React.JSX.Element {
  const handleChange = (text: string) => {
    // allow only digits + a single decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const sanitized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
    onChangeAmount(sanitized);
  };

  return (
    <>
      <Text className={isDark ? 'text-text-muted-dark text-xs mb-3 mt-8' : 'text-text-muted text-xs mb-3 mt-8'}>
        {t('send.amount')}
      </Text>
      <Input
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={handleChange}
        leftAccessory={
          <Pressable onPress={onCycleFromCountry} className="flex-row items-center">
            <CountryFlag isoCode={fromCountry} size={16} />
            <View
              style={{
                width: 1,
                height: 16,
                backgroundColor: isDark ? '#334155' : '#e2e8f0',
                marginHorizontal: 8,
              }}
            />
            <Text className={isDark ? 'text-text-main-dark font-semibold' : 'text-text-main font-semibold'}>
              {getCountry(fromCountry).currency_code}
            </Text>
          </Pressable>
        }
      />
    </>
  );
}
