import { View, Text, Pressable } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { RefreshControl } from 'react-native';
import React, {  useState, useCallback } from 'react';

import { supabase } from '@/lib/supabase';

import { useTranslation } from 'react-i18next';

import { Transfer } from '@/types/transactions';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

import Loading from '@/components/ui/Loading';
import ScreenContainer from '@/components/ui/ScreenContainer';

import TransactionItem from '../transactions/TransactionItem';
import EmptyTransactions from '../transactions/EmptyTransactions';

export default function RecentTransactions(): React.JSX.Element {
   const { isDark } = useTheme();
    const { session } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const { t } = useTranslation();

      const fetchTransfers = useCallback(async () => {
        if (!session?.user?.id) return;
        const { data, error } = await supabase
          .from('transfers')
          .select('id, recipient_name, to_country, from_country, amount_sent, amount_received, status, created_at')
          .limit(5)
          .eq('sender_id', session.user.id)
          .order('created_at', { ascending: false });
          
    
        if (!error && data) setTransfers(data as Transfer[]);
        setLoading(false);
        setRefreshing(false);
      }, [session?.user?.id]);
    
      useFocusEffect(
        useCallback(() => {
          fetchTransfers();
        }, [fetchTransfers])
      );
    
      const handleRefresh = (): void => {
        setRefreshing(true);
        fetchTransfers();
      };
    
      if (loading) {
        return (
          <Loading />
        );
      }

      return (
        <ScreenContainer scroll refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
          <View className="flex-row items-center pt-2 pb-4 justify-between">
            <Text
              className={
                isDark
                  ? 'text-text-main-dark font-bold text-xl'
                  : 'text-text-main font-bold text-xl'
              }
            >
              {t('home.recent_transactions')}
            </Text>

            <Pressable onPress={() => router.push('/(tabs)/transactions')}>
              <Text className="text-link text-lg">{t('home.see_all')}</Text>
            </Pressable>
          </View>
          {transfers.length === 0 ? (
            <EmptyTransactions isDark={isDark} />
          ) : (
            transfers.map((tx, index) => (
              <TransactionItem
                key={tx.id}
                tx={tx}
                index={index}
                total={transfers.length}
                isDark={isDark}
              />
            ))
          )}
        </ScreenContainer>
      );
    }
    
