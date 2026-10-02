import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

export default function SendWaitingScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { transferId } = useLocalSearchParams<{ transferId: string }>();
  const [status, setStatus] = useState('collecting');

  useEffect(() => {
    if (!transferId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from('transfers').select('status').eq('id', transferId).single();
      if (!data) return;
      setStatus(data.status);
      if (data.status === 'paid_out') {
        clearInterval(interval);
        router.replace({ pathname: '/home/send-success', params: { transferId } });
      }
      if (data.status === 'failed') {
        clearInterval(interval);
        router.replace({ pathname: '/home/send-failed', params: { transferId } });
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [transferId]);

  const messages: Record<string, string> = {
    collecting: 'Check your phone to approve the payment',
    confirmed: 'Payment received — sending to recipient…',
  };

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-8">
        <ActivityIndicator size="large" />
        <Text className={isDark ? 'text-text-main-dark text-center mt-6 text-base' : 'text-text-main text-center mt-6 text-base'}>
          {messages[status] ?? 'Processing…'}
        </Text>
      </View>
    </ScreenContainer>
  );
}