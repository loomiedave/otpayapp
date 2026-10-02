import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import Button from '../../../components/ui/Button';
import RecipientPicker from '@/components/send/RecipientPicker';
import PhoneField from '@/components/send/PhoneField';
import AmountField from '@/components/send/AmountField';
import ConversionSummary from '@/components/send/ConversionSummary';
import NetworkSelector, { getRequiredNetwork, type Network } from '@/components/send/NetworkSelector';
import CorridorNotice from '@/components/send/CorridorNotice';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useCountries } from '@/hooks/useCountries';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_COUNTRY_CODES } from '@/constants/countries';

interface Recipient {
  id: string;
  full_name: string;
  country: string;
  phone: string | null;
}

export default function SendScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { session } = useAuth();
  const { rates, loading: ratesLoading } = useExchangeRates();
  const { getCountry, loading: countriesLoading } = useCountries();
  const { t } = useTranslation();

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [recipientsError, setRecipientsError] = useState<string | null>(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [phone, setPhone] = useState<string>('');
  const [manualCountry, setManualCountry] = useState<string>('TG');
  const [amount, setAmount] = useState<string>('');
  const [fromCountry, setFromCountry] = useState<string>('GH');
  const [network, setNetwork] = useState<Network | null>(null);

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

  // Auto-select network when there's exactly one option (e.g. GH -> MTN only);
  // clear it when switching to a corridor requiring an explicit pick, or none at all.
  useEffect(() => {
    const options = getRequiredNetwork(toCountry);
    if (options && options.length === 1) {
      setNetwork(options[0].value);
    } else {
      setNetwork(null);
    }
  }, [toCountry]);

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
    const next = (SUPPORTED_COUNTRY_CODES.indexOf(manualCountry) + 1) % SUPPORTED_COUNTRY_CODES.length;
    setManualCountry(SUPPORTED_COUNTRY_CODES[next]);
  };

  const cycleFromCountry = () => {
    const next = (SUPPORTED_COUNTRY_CODES.indexOf(fromCountry) + 1) % SUPPORTED_COUNTRY_CODES.length;
    setFromCountry(SUPPORTED_COUNTRY_CODES[next]);
  };

  const numericAmount = parseFloat(amount) || 0;
  const selectedRate = toCountry ? rates.find((r) => r.from === fromCountry && r.to === toCountry) : undefined;
  const rate = selectedRate?.rate ?? 0;
  const fee = selectedRate?.fee ?? 0;
  const convertedAmount = Math.max(numericAmount - fee, 0) * rate;
  const corridorActive = selectedRate?.is_active ?? false;

  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark'
    : 'rounded-2xl bg-background-card border border-border-main';

  const networkRequired = (getRequiredNetwork(toCountry)?.length ?? 0) > 1;
  const canContinue = !!phone && !!toCountry && numericAmount > 0 && corridorActive && (!networkRequired || !!network);

  const handleContinue = (): void => {
    if (!canContinue || !toCountry) return;

    router.push({
      pathname: '/home/send-review',
      params: {
        recipientId: selectedRecipient?.id ?? '',
        recipientName: selectedRecipient?.full_name ?? '',
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

      <NetworkSelector toCountry={toCountry} network={network} setNetwork={setNetwork} cardClass={cardClass} isDark={isDark} t={t} />

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
