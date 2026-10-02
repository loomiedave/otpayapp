import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import CountryFlag from 'react-native-country-flag';
import { router } from 'expo-router';

const ACCENT_GOLD = '#D4A62B';

interface Recipient {
  id: string;
  full_name: string;
  country: string;
  phone: string | null;
}

interface RecipientPickerProps {
  recipients: Recipient[];
  selectedRecipientId: string | null;
  onSelect: (recipient: Recipient) => void;
  hasActiveCorridor: (country: string) => boolean;
  getCountry: (code: string) => { code: string; name: string; currency_code: string };
  isDark: boolean;
  t: (key: string) => string;
}

export default function RecipientPicker({
  recipients,
  selectedRecipientId,
  onSelect,
  hasActiveCorridor,
  getCountry,
  isDark,
  t,
}: RecipientPickerProps): React.JSX.Element {
  return (
    <>
      <Text className={isDark ? 'text-text-muted-dark text-xs mb-3' : 'text-text-muted text-xs mb-3'}>
        {t('send.recipient')}
      </Text>
      <View className="flex-row flex-wrap" style={{ gap: 12 }}>
        {recipients.map((r) => {
          const isSelected = r.id === selectedRecipientId;
          const rCountry = getCountry(r.country);
          const active = hasActiveCorridor(r.country);

          return (
            <Pressable
              key={r.id}
              onPress={() => onSelect(r)}
              className="items-center"
              style={{ opacity: active ? 1 : 0.4 }}
            >
              <View
                className="w-14 h-14 rounded-full items-center justify-center mb-1"
                style={{
                  overflow: 'hidden',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? ACCENT_GOLD : isDark ? '#334155' : '#e2e8f0',
                }}
              >
                {rCountry.code ? <CountryFlag isoCode={rCountry.code} size={32} /> : <Text className="text-xl">🏳️</Text>}
              </View>
              <Text
                className={isDark ? 'text-text-muted-dark text-xs' : 'text-text-muted text-xs'}
                numberOfLines={1}
                style={{ maxWidth: 60 }}
              >
                {r.full_name.split(' ')[0]}
              </Text>
            </Pressable>
          );
        })}

        <Pressable className="items-center" onPress={() => router.push('/add-recipient')}>
          <View
            className={
              isDark
                ? 'w-14 h-14 rounded-full items-center justify-center mb-1 border border-dashed border-border-main-dark'
                : 'w-14 h-14 rounded-full items-center justify-center mb-1 border border-dashed border-border-main'
            }
          >
            <Feather name="plus" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
          </View>
          <Text className={isDark ? 'text-text-muted-dark text-xs' : 'text-text-muted text-xs'}>{t('send.addNew')}</Text>
        </Pressable>
      </View>

      {recipients.length === 0 && (
        <Text className={isDark ? 'text-text-muted-dark text-xs mt-3' : 'text-text-muted text-xs mt-3'}>
          {t('send.noRecipients')}
        </Text>
      )}
    </>
  );
}
