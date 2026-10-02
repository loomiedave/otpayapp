import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../components/ui/ScreenContainer';
import ScreenHeader from '../components/ui/ScreenHeader';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { COUNTRIES, CountryCode, SUPPORTED_COUNTRY_CODES } from '@/constants/countries';
import { router } from 'expo-router';

const ACCENT_GOLD = '#D4A62B';

export default function AddRecipientScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { session } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<CountryCode | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark'
    : 'rounded-2xl bg-background-card border border-border-main';

  const isValid = fullName.trim().length > 0 && country !== null && phone.trim().length > 0;

  const handleSave = async (): Promise<void> => {
    if (!isValid || !session?.user?.id) return;
    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase.from('recipients').insert({
      owner_id: session.user.id,
      full_name: fullName.trim(),
      country,
      phone: phone.trim(),
    });

    setSaving(false);

    if (insertError) {
      setError('Could not save recipient. Try again.');
      return;
    }

    router.back();
  };

  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Add Recipient" />

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-3 mt-2' : 'text-text-muted text-xs mb-3 mt-2'}>
        COUNTRY
      </Text>
      <View className="flex-row flex-wrap" style={{ gap: 12 }}>
        {Object.keys(COUNTRIES).map((code) => {
          const isSupported = SUPPORTED_COUNTRY_CODES.includes(code as CountryCode);
          const isSelected = code === country;

          return (
            <Pressable
              key={code}
              onPress={() => isSupported && setCountry(code as CountryCode)}
              disabled={!isSupported}
              className="items-center"
              style={{ opacity: isSupported ? 1 : 0.4, width: 68 }}
            >
              <View
                className="w-14 h-14 rounded-full items-center justify-center mb-1"
                style={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? ACCENT_GOLD : isDark ? '#334155' : '#e2e8f0',
                }}
              >
                <Text className="text-xl">{COUNTRIES[code as CountryCode].flag}</Text>
              </View>
              <Text
                className={isDark ? 'text-text-muted-dark text-xs' : 'text-text-muted text-xs'}
                numberOfLines={1}
              >
                {COUNTRIES[code as CountryCode].name}
              </Text>
              {!isSupported && (
                <Text className="text-xs mt-0.5" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                  Coming soon
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-3 mt-8' : 'text-text-muted text-xs mb-3 mt-8'}>
        FULL NAME
      </Text>
      <Input placeholder="Enter recipient's name here" value={fullName} onChangeText={setFullName} autoCapitalize="words" />

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-3 mt-6' : 'text-text-muted text-xs mb-3 mt-6'}>
        PHONE
      </Text>
      <Input placeholder="Reciepient's number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      {country && (
        <View className={`${cardClass} mt-6 p-4 flex-row items-center`}>
          <Feather name="info" size={14} color={isDark ? '#94a3b8' : '#64748b'} />
          <Text className={isDark ? 'text-text-muted-dark text-xs ml-2 flex-1' : 'text-text-muted text-xs ml-2 flex-1'}>
            You'll be able to send in {COUNTRIES[country].currency} to this recipient.
          </Text>
        </View>
      )}

      {error && (
        <Text className="text-xs mt-4" style={{ color: '#ef4444' }}>
          {error}
        </Text>
      )}

      <View className="mt-8">
        <Button label={saving ? 'Saving…' : 'Save Recipient'} onPress={handleSave} disabled={!isValid || saving} />
      </View>
    </ScreenContainer>
  );
}
