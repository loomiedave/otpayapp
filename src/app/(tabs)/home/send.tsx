import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import CountryFlag from 'react-native-country-flag';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useCountries } from '@/hooks/useCountries';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { formatRate } from '@/lib/currency';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CountryCode } from '@/constants/countries';

const ACCENT_GOLD = '#D4A62B';

interface Recipient {
  id: string;
  full_name: string;
  country: string;
  phone: string | null;
}

// TEMP: hardcoded until real dial-code data exists in constants/countries.ts.
// Swap this out for real data later — this is a stand-in, not the fix.
const DIAL_CODE_TO_COUNTRY: Record<string, CountryCode> = {
  '234': 'NG',
  '233': 'GH',
  '228': 'TG',
  '229': 'BJ',
};

function inferCountryFromPhone(phone: string): CountryCode | null {
  const digits = phone.replace(/[^\d]/g, '');
  for (const [dial, code] of Object.entries(DIAL_CODE_TO_COUNTRY)) {
    if (digits.startsWith(dial)) return code;
  }
  return null;
}

export default function SendScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { session } = useAuth();
  const { rates, loading: ratesLoading } = useExchangeRates();
  const { getCountry, loading: countriesLoading } = useCountries();
  const { t } = useTranslation();

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [phone, setPhone] = useState<string>('');
  const [manualCountryOverride, setManualCountryOverride] = useState<CountryCode | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [fromCountry, setFromCountry] = useState<string>('GH');
  const [network, setNetwork] = useState<'mtn' | 'flooz' | 'tmoney' | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase
      .from('recipients')
      .select('id, full_name, country, phone')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setRecipients(data as Recipient[]);
        }
        setRecipientsLoading(false);
      });
  }, [session?.user?.id]);

  // Country now comes from: a selected recipient's stored country, OR
  // inferred from the typed phone number. No recipient is required.
  const toCountry: CountryCode | null = manualCountryOverride ?? inferCountryFromPhone(phone);

  useEffect(() => {
    if (toCountry === 'GH') {
      setNetwork('mtn');
    } else if (toCountry === 'TG' || toCountry === 'BJ') {
      setNetwork((prev) => (prev === 'flooz' || prev === 'tmoney' ? prev : null));
    } else {
      setNetwork(null);
    }
  }, [toCountry]);

  const activeCountries = Array.from(
    new Set(rates.filter((r) => r.is_active).flatMap((r) => [r.from, r.to]))
  );

  const numericAmount = parseFloat(amount) || 0;
  const selectedRate = toCountry
    ? rates.find((r) => r.from === fromCountry && r.to === toCountry)
    : undefined;
  const rate = selectedRate?.rate ?? 0;
  const fee = selectedRate?.fee ?? 0;

  // TEMP: only charge the flat fee once the amount exceeds it, so small
  // amounts don't get wiped to 0. Real "no fee under threshold X" rule
  // still needs proper product input — this just stops the visible bug.
  const feeApplies = numericAmount > fee;
  const effectiveFee = feeApplies ? fee : 0;
  const convertedAmount = Math.max(numericAmount - effectiveFee, 0) * rate;
  const corridorActive = selectedRate?.is_active ?? false;

  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark'
    : 'rounded-2xl bg-background-card border border-border-main';

  const cycleFromCountry = () => {
    if (activeCountries.length === 0) return;
    const nextIndex = (activeCountries.indexOf(fromCountry) + 1) % activeCountries.length;
    setFromCountry(activeCountries[nextIndex]);
  };

  const selectRecipient = (r: Recipient) => {
    setSelectedRecipientId(r.id);
    setPhone(r.phone ?? '');
    setManualCountryOverride(r.country as CountryCode);
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    // Typing over the number deselects any picked recipient and drops
    // back to inferring the country from what's typed.
    setSelectedRecipientId(null);
    setManualCountryOverride(null);
  };

  const handleContinue = (): void => {
    if (!phone || !toCountry || !corridorActive || !network) return;

    const selectedRecipient = recipients.find((r) => r.id === selectedRecipientId);

    router.push({
      pathname: '/home/send-review',
      params: {
        recipientId: selectedRecipient?.id ?? '',
        recipientName: selectedRecipient?.full_name ?? '',
        recipientPhone: phone,
        recipientCountry: toCountry,
        network,
        amount,
        fromCountry,
        toCountry,
        fee: effectiveFee.toString(),
        convertedAmount: convertedAmount.toString(),
        rate: rate.toString(),
      },
    });
  };

  if (recipientsLoading || ratesLoading || countriesLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title={t('send.title')} />
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <ScreenHeader title={t('send.title')} />

      {recipients.length > 0 && (
        <>
          <Text className={isDark ? 'text-text-muted-dark text-xs mb-3' : 'text-text-muted text-xs mb-3'}>
            {t('send.recipient')}
          </Text>
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {recipients.map((r) => {
              const isSelected = r.id === selectedRecipientId;
              const rCountry = getCountry(r.country);
              const hasActiveCorridor = rates.some((rt) => rt.to === r.country && rt.is_active);

              return (
                <Pressable
                  key={r.id}
                  onPress={() => selectRecipient(r)}
                  className="items-center"
                  style={{ opacity: hasActiveCorridor ? 1 : 0.4 }}
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
                    {rCountry.code ? (
                      <CountryFlag isoCode={rCountry.code} size={32} />
                    ) : (
                      <Text className="text-xl">🏳️</Text>
                    )}
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
            <Pressable className="items-center" onPress={() => router.push('/(tabs)/recipients/add-recipient')}>
              <View
                className={
                  isDark
                    ? 'w-14 h-14 rounded-full items-center justify-center mb-1 border border-dashed border-border-main-dark'
                    : 'w-14 h-14 rounded-full items-center justify-center mb-1 border border-dashed border-border-main'
                }
              >
                <Feather name="plus" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              </View>
              <Text className={isDark ? 'text-text-muted-dark text-xs' : 'text-text-muted text-xs'}>
                {t('send.addNew')}
              </Text>
            </Pressable>
          </View>
        </>
      )}

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-3 mt-8' : 'text-text-muted text-xs mb-3 mt-8'}>
        {t('send.recipientPhone')}
      </Text>
      <Input
        placeholder="+233 XX XXX XXXX"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={handlePhoneChange}
      />

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-3 mt-8' : 'text-text-muted text-xs mb-3 mt-8'}>
        {t('send.amount')}
      </Text>
      <Input
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
        leftAccessory={
          <Pressable onPress={cycleFromCountry} className="flex-row items-center">
            <CountryFlag isoCode={fromCountry} size={16} />
            <Text className={isDark ? 'text-text-main-dark font-semibold ml-1' : 'text-text-main font-semibold ml-1'}>
              {getCountry(fromCountry).currency_code}
            </Text>
          </Pressable>
        }
      />

      <View className={`${cardClass} mt-4 p-4`}>
        <View className="flex-row items-center justify-between">
          <Text className={isDark ? 'text-text-muted-dark text-sm' : 'text-text-muted text-sm'}>
            {t('send.recipientGets')}
          </Text>
          {toCountry ? (
            <View className="flex-row items-center">
              <CountryFlag isoCode={toCountry} size={16} />
              <Text className={isDark ? 'text-text-main-dark font-semibold text-sm ml-1' : 'text-text-main font-semibold text-sm ml-1'}>
                {getCountry(toCountry).currency_code}
              </Text>
            </View>
          ) : (
            <Text className={isDark ? 'text-text-muted-dark text-sm' : 'text-text-muted text-sm'}>
              {t('send.enterPhone')}
            </Text>
          )}
        </View>

        {toCountry && (
          <>
            <Text className={isDark ? 'text-text-main-dark font-bold mt-2' : 'text-text-main font-bold mt-2'} style={{ fontSize: 28 }}>
              {formatRate(convertedAmount)}
            </Text>
            <Text className={isDark ? 'text-text-muted-dark text-xs mt-1' : 'text-text-muted text-xs mt-1'}>
              1 {getCountry(fromCountry).currency_code} = {formatRate(rate)} {getCountry(toCountry).currency_code}
              {effectiveFee > 0
                ? `  ·  ${t('send.fee', { fee: effectiveFee, currency: getCountry(fromCountry).currency_code })}`
                : `  ·  ${t('send.noFee')}`}
            </Text>
          </>
        )}
      </View>

      {(toCountry === 'TG' || toCountry === 'BJ') && (
        <View className="mt-4">
          <Text className={isDark ? 'text-text-muted-dark text-xs mb-2' : 'text-text-muted text-xs mb-2'}>
            {t('send.selectNetwork')}
          </Text>
          <View className="flex-row" style={{ gap: 12 }}>
            {(['flooz', 'tmoney'] as const).map((n) => (
              <Pressable
                key={n}
                onPress={() => setNetwork(n)}
                className={`${cardClass} px-4 py-2`}
                style={{
                  borderColor: network === n ? ACCENT_GOLD : undefined,
                  borderWidth: network === n ? 2 : 1,
                }}
              >
                <Text className={isDark ? 'text-text-main-dark' : 'text-text-main'}>
                  {n === 'flooz' ? 'Flooz' : 'T-Money'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {toCountry && !corridorActive && (
        <View className={`${cardClass} mt-4 p-4 flex-row items-center`}>
          <Feather name="clock" size={14} color={isDark ? '#94a3b8' : '#64748b'} />
          <Text className={isDark ? 'text-text-muted-dark text-xs ml-2 flex-1' : 'text-text-muted text-xs ml-2 flex-1'}>
            {t('send.corridorInactive', {
              from: getCountry(fromCountry).name,
              to: getCountry(toCountry).name,
            })}
          </Text>
        </View>
      )}

      <View className="mt-8">
        <Button
          label={t('send.continue')}
          onPress={handleContinue}
          disabled={!phone || numericAmount <= 0 || !corridorActive || !network}
        />
      </View>
    </ScreenContainer>
  );
}
