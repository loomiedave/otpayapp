import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';

import { supabase } from '@/lib/supabase';

import { useTranslation } from 'react-i18next';

import { useTheme } from '@/contexts/ThemeContext';

import ScreenContainer from '@/components/ui/ScreenContainer';

export default function SendWaitingScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [status, setStatus] = useState('collecting');
  const { transferId } = useLocalSearchParams<{ transferId: string }>();

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
    collecting: `${t('send.approve_payment')}`,
    confirmed: `${t('send.confirmed')}`,
  };

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-8">
        <ActivityIndicator size="large" />
        <Text className={isDark ? 'text-text-main-dark text-center mt-6 text-base' : 'text-text-main text-center mt-6 text-base'}>
          {messages[status] ?? `${t('send.processing')}`}
        </Text>
      </View>
    </ScreenContainer>
  );
}