import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import CountryFlag from 'react-native-country-flag';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useCountries } from '@/hooks/useCountries';
import { formatRate } from '@/lib/currency';
import { useTranslation } from 'react-i18next';

const FLAT_FEE = 2.5; // mock fee, wire up to real pricing later

// TODO: replace with your real business collection numbers
const COLLECTION_NUMBERS: Record<string, string> = {
  GH: '+233 XX XXX XXXX (MTN MoMo)',
  TG: '+228 XX XXX XXXX (Flooz / T-Money)',
};

export default function SendReviewScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { session } = useAuth();
  const { getCountry } = useCountries();
  const { t } = useTranslation();
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useLocalSearchParams<{
    recipientId: string;
    recipientName: string;
    recipientPhone: string;
    recipientCountry: string;
    network: string;
    amount: string;
    fromCountry: string;
    toCountry: string;
    convertedAmount: string;
    rate: string;
  }>();

  const fromCountry = getCountry(params.fromCountry);
  const toCountry = getCountry(params.toCountry);

  const numericAmount = parseFloat(params.amount) || 0;
  const total = numericAmount + FLAT_FEE;

  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark'
    : 'rounded-2xl bg-background-card border border-border-main';

  const rowClass = isDark
    ? 'flex-row items-center justify-between py-3 border-b border-border-main-dark'
    : 'flex-row items-center justify-between py-3 border-b border-border-main';

  const labelClass = isDark ? 'text-text-muted-dark text-sm' : 'text-text-muted text-sm';
  const valueClass = isDark ? 'text-text-main-dark font-semibold text-sm' : 'text-text-main font-semibold text-sm';

  const handleConfirm = async (): Promise<void> => {
    if (!reference.trim() || !session?.user?.id) return;
    setIsSubmitting(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from('transfers')
      .insert({
        sender_id: session.user.id,
        recipient_id: params.recipientId,
        recipient_name: params.recipientName,
        recipient_phone: params.recipientPhone,
        from_country: params.fromCountry,
        to_country: params.toCountry,
        network: params.network,
        amount_sent: numericAmount,
        fee: FLAT_FEE,
        rate_used: parseFloat(params.rate),
        amount_received: parseFloat(params.convertedAmount),
        collection_reference: reference.trim(),
        status: 'pending_verification',
      })
      .select()
      .single();

    setIsSubmitting(false);

    if (insertError || !data) {
      setError('Could not submit transfer. Try again.');
      return;
    }

    router.replace({
      pathname: '/home/send-success',
      params: { transferId: data.id },
    });
  };

  return (
    <ScreenContainer scroll>
      <ScreenHeader title={t('sendReview.title')} />

      <View className="items-center mb-8 mt-2">
        <Text className={isDark ? 'text-text-main-dark font-bold text-lg' : 'text-text-main font-bold text-lg'}>
          {params.recipientName}
        </Text>
        <Text
          className={isDark ? 'text-text-main-dark font-bold mt-2' : 'text-text-main font-bold mt-2'}
          style={{ fontSize: 32 }}
        >
          {formatRate(parseFloat(params.convertedAmount))} {toCountry.currency_code}
        </Text>
      </View>

      <View className={`${cardClass} px-4`}>
        <View className={rowClass}>
          <Text className={labelClass}>{t('sendReview.youSend')}</Text>
          <Text className={valueClass}>{formatRate(numericAmount)} {fromCountry.currency_code}</Text>
        </View>
        <View className={rowClass}>
          <Text className={labelClass}>{t('sendReview.transferFee')}</Text>
          <Text className={valueClass}>{formatRate(FLAT_FEE)} {fromCountry.currency_code}</Text>
        </View>
        <View className="flex-row items-center justify-between py-3">
          <Text className={isDark ? 'text-text-main-dark font-bold' : 'text-text-main font-bold'}>{t('sendReview.total')}</Text>
          <Text className={isDark ? 'text-text-main-dark font-bold' : 'text-text-main font-bold'}>
            {formatRate(total)} {fromCountry.currency_code}
          </Text>
        </View>
      </View>

      <View className={`${cardClass} mt-4 p-4`}>
        <Text className={isDark ? 'text-text-main-dark font-semibold text-sm mb-1' : 'text-text-main font-semibold text-sm mb-1'}>
          Send {formatRate(total)} {fromCountry.currency_code} to
        </Text>
        <Text className={isDark ? 'text-text-muted-dark text-sm' : 'text-text-muted text-sm'}>
          {COLLECTION_NUMBERS[params.fromCountry]}
        </Text>
      </View>

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-2 mt-6' : 'text-text-muted text-xs mb-2 mt-6'}>
        TRANSACTION ID FROM YOUR PAYMENT
      </Text>
      <Input placeholder="e.g. MP240916.1234.A56789" value={reference} onChangeText={setReference} />

      {error && (
        <Text className="text-xs mt-3" style={{ color: '#ef4444' }}>
          {error}
        </Text>
      )}

      <View className="mt-8">
        <Button
          label={t('sendReview.confirm')}
          onPress={handleConfirm}
          loading={isSubmitting}
          disabled={!reference.trim()}
        />
      </View>
    </ScreenContainer>
  );
}
