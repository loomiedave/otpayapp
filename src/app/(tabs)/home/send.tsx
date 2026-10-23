import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

import { supabase } from '@/lib/supabase';
import { detectNetwork } from '@/lib/send/networkDetection';

import { Feather } from '@expo/vector-icons';

import { SUPPORTED_COUNTRY_CODES } from '@/constants/countries';

import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';

import { useCountries } from '@/hooks/useCountries';
import { useExchangeRates } from '@/hooks/useExchangeRates';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import ScreenContainer from '../../../components/ui/ScreenContainer';

import PhoneField from '@/components/send/PhoneField';
import AmountField from '@/components/send/AmountField';
import CorridorNotice from '@/components/send/CorridorNotice';
import RecipientPicker from '@/components/send/RecipientPicker';
import ConversionSummary from '@/components/send/ConversionSummary';
import { getRequiredNetwork } from '@/components/send/NetworkSelector';

interface Recipient {
  id: string;
  full_name: string;
  country: string;
  phone: string | null;
}

const nextCountryCode = (current: string): string =>
  SUPPORTED_COUNTRY_CODES[(SUPPORTED_COUNTRY_CODES.indexOf(current) + 1) % SUPPORTED_COUNTRY_CODES.length];

export default function SendScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { session } = useAuth();
  const { t } = useTranslation();
  const { rates, loading: ratesLoading } = useExchangeRates();
  const { getCountry, loading: countriesLoading } = useCountries();

  const [phone, setPhone] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [manualName, setManualName] = useState<string>('');

  const [fromCountry, setFromCountry] = useState<string>('GH');
  const [manualCountry, setManualCountry] = useState<string>('TG');

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [recipientsError, setRecipientsError] = useState<string | null>(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);

  const loadRecipients = () => {
    if (!session?.user?.id) return;
    setRecipientsLoading(true);
    setRecipientsError(null);

    supabase
      .from('recipients')
      .select('id, full_name, country, phone')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setRecipientsError(error.message);
        } else if (data) {
          setRecipients(data as Recipient[]);
          if (data.length > 0) {
            setSelectedRecipientId(data[0].id);
            setPhone(data[0].phone ?? '');
          }
        }
        setRecipientsLoading(false);
      });
  };

  useEffect(() => {
    loadRecipients();
  }, [session?.user?.id]);

  const selectedRecipient = recipients.find((r) => r.id === selectedRecipientId);
  const toCountry: string | null = selectedRecipient ? selectedRecipient.country : manualCountry;

  // Network is decided by the app (lib/send/networkDetection.ts), not by the user.
  const network = detectNetwork(toCountry, phone);
  const networkOptions = getRequiredNetwork(toCountry);
  const needsNetwork = !!networkOptions;
  const networkLabel = networkOptions?.find((o) => o.value === network)?.label ?? null;

  const handleSelectRecipient = (r: Recipient) => {
    setSelectedRecipientId(r.id);
    setPhone(r.phone ?? '');
  };

  const handleChangePhone = (value: string) => {
    setPhone(value);
    // if editing away from the selected recipient's number, treat this as a manual entry
    if (selectedRecipient && value !== (selectedRecipient.phone ?? '')) {
      setSelectedRecipientId(null);
    }
  };

  const cycleManualCountry = () => {
    setManualCountry(nextCountryCode(toCountry ?? manualCountry));
    setSelectedRecipientId(null);
  };

  const cycleFromCountry = () => {
    setFromCountry(nextCountryCode(fromCountry));
  };

  // --- money ---
  const numericAmount = parseFloat(amount) || 0;
  const selectedRate = toCountry ? rates.find((r) => r.from === fromCountry && r.to === toCountry) : undefined;
  const rate = Number(selectedRate?.rate ?? 0);
  const fee = Number(selectedRate?.fee ?? 0);
  const corridorActive = selectedRate?.is_active ?? false;

  // Round once, at the end, to the destination currency (XOF = 0 decimals, others = 2).
  const decimals = toCountry && getCountry(toCountry)?.currency_code === 'XOF' ? 0 : 2;
  const factor = 10 ** decimals;
  const netCents = Math.max(Math.round(numericAmount * 100) - Math.round(fee * 100), 0);
  const convertedAmount = Math.round((netCents / 100) * rate * factor) / factor;

  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark'
    : 'rounded-2xl bg-background-card border border-border-main';

  const recipientName = selectedRecipient ? selectedRecipient.full_name : manualName.trim();

  const canContinue =
    !!phone &&
    !!toCountry &&
    !!recipientName &&
    numericAmount > fee &&
    convertedAmount > 0 &&
    corridorActive &&
    (!needsNetwork || !!network);

  const handleContinue = (): void => {
    if (!canContinue || !toCountry) return;

    router.push({
      pathname: '/home/send-review',
      params: {
        recipientId: selectedRecipient?.id ?? '',
        recipientName,
        recipientPhone: phone,
        recipientCountry: toCountry,
        network: network ?? '',
        amount,
        fromCountry,
        toCountry,
        fee: fee.toString(),
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

  if (recipientsError) {
    return (
      <ScreenContainer>
        <ScreenHeader title={t('send.title')} />
        <View className="flex-1 items-center justify-center py-20 px-6">
          <Feather name="alert-circle" size={28} color={isDark ? '#f87171' : '#dc2626'} />
          <Text className={isDark ? 'text-text-main-dark text-sm text-center mt-3 mb-4' : 'text-text-main text-sm text-center mt-3 mb-4'}>
            {t('send.recipientsLoadError')}
          </Text>
          <Button label={t('common.retry')} onPress={loadRecipients} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <ScreenHeader title={t('send.title')} />

      <RecipientPicker
        recipients={recipients}
        selectedRecipientId={selectedRecipientId}
        onSelect={handleSelectRecipient}
        hasActiveCorridor={(country) => rates.some((rt) => rt.to === country && rt.is_active)}
        getCountry={getCountry}
        isDark={isDark}
        t={t}
      />

      {!selectedRecipient && (
        <>
          <Text className={isDark ? 'text-text-muted-dark text-xs mb-3 mt-8' : 'text-text-muted text-xs mb-3 mt-8'}>
            {t('send.recipientName', { defaultValue: 'Recipient name' })}
          </Text>
          <Input
            placeholder={t('send.recipientNamePlaceholder', { defaultValue: 'Full name' })}
            value={manualName}
            onChangeText={setManualName}
          />
        </>
      )}

      <PhoneField
        phone={phone}
        onChangePhone={handleChangePhone}
        manualCountry={toCountry ?? manualCountry}
        onCycleManualCountry={cycleManualCountry}
        isUsingRecipient={!!selectedRecipient}
        getCountry={getCountry}
        isDark={isDark}
        t={t}
      />

      {needsNetwork && (
        <View className="mt-3">
          {networkLabel ? (
            <Text className={isDark ? 'text-text-muted-dark text-xs' : 'text-text-muted text-xs'}>
              {t('send.network', { defaultValue: 'Network' })}: {networkLabel}
            </Text>
          ) : phone.replace(/\D/g, '').length >= 2 ? (
            <Text style={{ color: isDark ? '#f87171' : '#dc2626', fontSize: 12 }}>
              {t('send.networkNotSupported', { defaultValue: 'This phone number is not supported.' })}
            </Text>
          ) : null}
        </View>
      )}

      <AmountField
        amount={amount}
        onChangeAmount={setAmount}
        fromCountry={fromCountry}
        onCycleFromCountry={cycleFromCountry}
        getCountry={getCountry}
        isDark={isDark}
        t={t}
      />

      <ConversionSummary
        toCountry={toCountry}
        fromCountry={fromCountry}
        convertedAmount={convertedAmount}
        rate={rate}
        fee={fee}
        getCountry={getCountry}
        isDark={isDark}
        t={t}
        cardClass={cardClass}
      />

      <CorridorNotice
        show={!!toCountry && !corridorActive}
        fromCountry={fromCountry}
        toCountry={toCountry}
        getCountry={getCountry}
        isDark={isDark}
        t={t}
        cardClass={cardClass}
      />

      <View className="mt-8">
        <Button label={t('send.continue')} onPress={handleContinue} disabled={!canContinue} />
      </View>
    </ScreenContainer>
  );
}