import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import { supabase } from '@/lib/supabase';

import { useTranslation } from 'react-i18next';

import { useTheme } from '@/contexts/ThemeContext';

import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import ScreenContainer from '@/components/ui/ScreenContainer';

export default function SendFailedScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [recipientName, setRecipientName] = useState('');
  const { transferId } = useLocalSearchParams<{ transferId: string }>();

  useEffect(() => {
    if (!transferId) return;
    supabase
      .from('transfers')
      .select('recipient_name')
      .eq('id', transferId)
      .single()
      .then(({ data }) => {
        if (data) setRecipientName(data.recipient_name);
        setLoading(false);
      });
  }, [transferId]);

  const handleTryAgain = (): void => {
    router.replace('/home');
  };

  if (loading) {
    return (
     <Loading />
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-8">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: isDark ? '#450a0a' : '#fee2e2' }}
        >
          <Feather name="x" size={36} color={isDark ? '#f87171' : '#dc2626'} />
        </View>

        <Text
          className={
            isDark ? 'text-2xl font-bold text-text-main-dark text-center mb-2' : 'text-2xl font-bold text-text-main text-center mb-2'
          }
        >
          {t('send.failed')}
        </Text>
        <Text
          className={
            isDark
              ? 'text-text-muted-dark text-base text-center leading-5 mb-8'
              : 'text-text-muted text-base text-center leading-5 mb-8'
          }
        >
          {recipientName
            ? `${t('send.could_not_complete_to')} ${recipientName}. ${t('send.no_charge')}`
            : `${t('send.could_not_complete')}`}
        </Text>

        <View className="w-full">
          <Button label={t('send.try_again')} onPress={handleTryAgain} />
        </View>
      </View>
    </ScreenContainer>
  );
}