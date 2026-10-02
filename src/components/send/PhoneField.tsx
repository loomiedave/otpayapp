import React from 'react';
import { View, Text, Pressable } from 'react-native';
import CountryFlag from 'react-native-country-flag';
import Input from '../ui/Input';

interface PhoneFieldProps {
  phone: string;
  onChangePhone: (value: string) => void;
  manualCountry: string;
  onCycleManualCountry: () => void;
  isUsingRecipient: boolean;
  getCountry: (code: string) => { code: string; name: string; currency_code: string };
  isDark: boolean;
  t: (key: string) => string;
}

export default function PhoneField({
  phone,
  onChangePhone,
  manualCountry,
  onCycleManualCountry,
  isUsingRecipient,
  getCountry,
  isDark,
  t,
}: PhoneFieldProps): React.JSX.Element {
  return (
    <>
      <Text className={isDark ? 'text-text-muted-dark text-xs mb-3 mt-8' : 'text-text-muted text-xs mb-3 mt-8'}>
        {t('send.recipientPhone')}
      </Text>
      <Input
        placeholder={t('send.phonePlaceholder')}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={onChangePhone}
        leftAccessory={
          isUsingRecipient ? (
            <View className="flex-row items-center">
              <CountryFlag isoCode={getCountry(manualCountry).code} size={16} />
              <View
                    style={{
                      width: 1,
                      height: 16,
                      backgroundColor: isDark ? '#334155' : '#e2e8f0',
                      marginHorizontal: 8,
                    }}
                  />
            </View>
          ) : (
            <Pressable onPress={onCycleManualCountry} className="flex-row items-center">
              <CountryFlag isoCode={getCountry(manualCountry).code} size={16} />
            </Pressable>
          )
        }
      />
    </>
  );
}
