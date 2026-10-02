import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '@/lib/supabase';

export default function SendFailedScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { transferId } = useLocalSearchParams<{ transferId: string }>();
  const [recipientName, setRecipientName] = useState('');
  const [loading, setLoading] = useState(true);

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
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </ScreenContainer>
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
          Transfer Failed
        </Text>
        <Text
          className={
            isDark
              ? 'text-text-muted-dark text-base text-center leading-5 mb-8'
              : 'text-text-muted text-base text-center leading-5 mb-8'
          }
        >
          {recipientName
            ? `We couldn't complete the transfer to ${recipientName}. Nothing was charged beyond what the payment network attempted.`
            : "We couldn't complete this transfer."}
        </Text>

        <View className="w-full">
          <Button label="Try Again" onPress={handleTryAgain} />
        </View>
      </View>
    </ScreenContainer>
  );
}