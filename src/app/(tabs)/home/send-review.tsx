import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useCountries } from '@/hooks/useCountries';
import { formatRate } from '@/lib/currency';
import { useTranslation } from 'react-i18next';

const FLAT_FEE = 2.5; // mock fee, wire up to real pricing later

export default function SendReviewScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { session } = useAuth();
  const { getCountry } = useCountries();
  const { t } = useTranslation();
  const [payerPhone, setPayerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useLocalSearchParams<{
    recipientId: string;
    recipientName: string;
    recipientPhone: string;
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

  const payerNetworkLabel = params.fromCountry === 'GH' ? 'MTN MoMo' : 'Flooz / T-Money';

  const handleConfirm = async (): Promise<void> => {
    if (!payerPhone.trim() || !session?.user?.id) return;
    setIsSubmitting(true);
    setError(null);

    const { data, error: fnError } = await supabase.functions.invoke('initiate-transfer', {
      body: {
        senderId: session.user.id,
        recipientId: params.recipientId,
        recipientName: params.recipientName,
        recipientPhone: params.recipientPhone,
        payerPhone: payerPhone.trim(), // the number that gets the payment prompt — NOT the recipient's
        fromCountry: params.fromCountry,
        toCountry: params.toCountry,
        network: params.network,
        amountSent: numericAmount,
        fee: FLAT_FEE,
        rateUsed: parseFloat(params.rate),
        amountReceived: parseFloat(params.convertedAmount),
      },
    });

    setIsSubmitting(false);

    if (fnError || !data?.transferId) {
      setError('Could not start transfer. Try again.');
      return;
    }

    router.replace({ pathname: '/home/send-waiting', params: { transferId: data.transferId } });
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
          <Text className={valueClass}>
            {formatRate(numericAmount)} {fromCountry.currency_code}
          </Text>
        </View>
        <View className={rowClass}>
          <Text className={labelClass}>{t('sendReview.transferFee')}</Text>
          <Text className={valueClass}>
            {formatRate(FLAT_FEE)} {fromCountry.currency_code}
          </Text>
        </View>
        <View className="flex-row items-center justify-between py-3">
          <Text className={isDark ? 'text-text-main-dark font-bold' : 'text-text-main font-bold'}>
            {t('sendReview.total')}
          </Text>
          <Text className={isDark ? 'text-text-main-dark font-bold' : 'text-text-main font-bold'}>
            {formatRate(total)} {fromCountry.currency_code}
          </Text>
        </View>
      </View>

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-2 mt-6' : 'text-text-muted text-xs mb-2 mt-6'}>
        NUMBER TO CHARGE ({payerNetworkLabel.toUpperCase()})
      </Text>
      <TextField
        placeholder="e.g. 0242439784"
        keyboardType="phone-pad"
        value={payerPhone}
        onChangeText={setPayerPhone}
      />
      <Text className={isDark ? 'text-text-muted-dark text-xs mt-2' : 'text-text-muted text-xs mt-2'}>
        You'll get a prompt on this number to approve the payment.
      </Text>

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
          disabled={!payerPhone.trim()}
        />
      </View>
    </ScreenContainer>
  );
}