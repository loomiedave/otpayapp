import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import CountryFlag from 'react-native-country-flag';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useCountries } from '@/hooks/useCountries';
import { formatRate } from '@/lib/currency';

type TransferStatus = 'pending_verification' | 'confirmed' | 'paid_out' | 'failed';

interface Transfer {
  id: string;
  recipient_name: string;
  to_country: string;
  from_country: string;
  amount_sent: number;
  amount_received: number;
  status: TransferStatus;
  created_at: string;
}

const STATUS_STYLES: Record<TransferStatus, { light: string; dark: string; label: string }> = {
  pending_verification: { light: '#d97706', dark: '#fbbf24', label: 'Pending' },
  confirmed: { light: '#d97706', dark: '#fbbf24', label: 'Confirmed' },
  paid_out: { light: '#16a34a', dark: '#4ade80', label: 'Completed' },
  failed: { light: '#dc2626', dark: '#f87171', label: 'Failed' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today, ${time}`;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
}

export default function TransactionsScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { session } = useAuth();
  const { getCountry } = useCountries();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      <ScreenContainer>
        <ScreenHeader title="Transactions" />
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      <ScreenHeader title="Transactions" />
      {transfers.length === 0 ? (
        <View className="items-center justify-center py-16">
          <View
            className={
              isDark
                ? 'w-16 h-16 rounded-full bg-background-card-dark items-center justify-center mb-4'
                : 'w-16 h-16 rounded-full bg-background-card items-center justify-center mb-4'
            }
          >
            <Feather name="clock" size={26} color={isDark ? '#94a3b8' : '#64748b'} />
          </View>
          <Text className={isDark ? 'text-text-main-dark font-bold text-base mb-1' : 'text-text-main font-bold text-base mb-1'}>
            No transactions yet
          </Text>
          <Text className={isDark ? 'text-text-muted-dark text-sm text-center px-8' : 'text-text-muted text-sm text-center px-8'}>
            Your sent and received transfers will show up here.
          </Text>
        </View>
      ) : (
        transfers.map((tx, index) => {
          const statusColor = isDark ? STATUS_STYLES[tx.status].dark : STATUS_STYLES[tx.status].light;
          const toCountry = getCountry(tx.to_country);
          return (
            <Pressable
              key={tx.id}
              onPress={() => router.push({ pathname: '/home/transaction-detail', params: { id: tx.id } })}
              className={`flex-row items-center py-4 active:opacity-70 ${
                index !== transfers.length - 1
                  ? isDark ? 'border-b border-border-main-dark' : 'border-b border-border-main'
                  : ''
              }`}
            >
              <View
                className={
                  isDark
                    ? 'w-11 h-11 rounded-full bg-background-card-dark items-center justify-center mr-4 overflow-hidden'
                    : 'w-11 h-11 rounded-full bg-background-card items-center justify-center mr-4 overflow-hidden'
                }
              >
                {toCountry.code ? <CountryFlag isoCode={toCountry.code} size={28} /> : <Text className="text-lg">🏳️</Text>}
              </View>
              <View className="flex-1">
                <Text className={isDark ? 'text-text-main-dark font-bold text-base' : 'text-text-main font-bold text-base'}>
                  {tx.recipient_name}
                </Text>
                <Text className={isDark ? 'text-text-muted-dark text-xs mt-0.5' : 'text-text-muted text-xs mt-0.5'}>
                  {formatDate(tx.created_at)}
                </Text>
              </View>
              <View className="items-end">
                <Text className={isDark ? 'text-text-main-dark font-semibold text-sm' : 'text-text-main font-semibold text-sm'}>
                  {formatRate(tx.amount_received)} {toCountry.currency_code}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: statusColor }} />
                  <Text className="text-xs font-medium" style={{ color: statusColor }}>
                    {STATUS_STYLES[tx.status].label}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })
      )}
    </ScreenContainer>
  );
}
