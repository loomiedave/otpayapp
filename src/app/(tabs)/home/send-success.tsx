import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useCountries } from '@/hooks/useCountries';
import { formatRate } from '@/lib/currency';

export default function SendSuccessScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { getCountry } = useCountries();
  const { transferId } = useLocalSearchParams<{ transferId: string }>();
  const [recipientName, setRecipientName] = useState('');
  const [amountReceived, setAmountReceived] = useState(0);
  const [toCountryCode, setToCountryCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transferId) return;
    supabase
      .from('transfers')
      .select('recipient_name, amount_received, to_country')
      .eq('id', transferId)
      .single()
      .then(({ data }) => {
        if (data) {
          setRecipientName(data.recipient_name);
          setAmountReceived(data.amount_received);
          setToCountryCode(data.to_country);
        }
        setLoading(false);
      });
  }, [transferId]);

  const handleDone = (): void => {
    router.replace('/home');
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </ScreenContainer>
    );
  }

  const toCountry = getCountry(toCountryCode);

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-8">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: isDark ? '#78350f' : '#fef3c7' }}
        >
          <Feather name="clock" size={36} color={isDark ? '#fbbf24' : '#d97706'} />
        </View>

        <Text className={isDark ? 'text-2xl font-bold text-text-main-dark text-center mb-2' : 'text-2xl font-bold text-text-main text-center mb-2'}>
          Transfer Submitted
        </Text>
        <Text className={isDark ? 'text-text-muted-dark text-base text-center leading-5 mb-8' : 'text-text-muted text-base text-center leading-5 mb-8'}>
          We're verifying your payment. Once confirmed,{'\n'}
          {formatRate(amountReceived)} {toCountry.currency_code} will be sent to{'\n'}
          <Text className={isDark ? 'text-text-main-dark font-semibold' : 'text-text-main font-semibold'}>{recipientName}</Text>
        </Text>

        <View className="w-full">
          <Button label="Done" onPress={handleDone} />
        </View>
      </View>
    </ScreenContainer>
  );
}
