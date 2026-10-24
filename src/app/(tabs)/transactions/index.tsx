import { useFocusEffect } from 'expo-router';
import { RefreshControl } from 'react-native';
import React, {  useState, useCallback } from 'react';

import { supabase } from '@/lib/supabase';

import { Transfer } from '@/types/transactions';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

import Loading from '@/components/ui/Loading';
import ScreenHeader from '@/components/ui/ScreenHeader';
import ScreenContainer from '@/components/ui/ScreenContainer'
import TransactionItem from '@/components//transactions/TransactionItem';
import EmptyTransactions from '@/components/transactions/EmptyTransactions';

export default function TransactionsScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  const fetchTransfers = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('transfers')
      .select('id, recipient_name, to_country, from_country, amount_sent, amount_received, status, created_at')
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
      <ScreenHeader title="Transactions" showBackButton={false} />
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
