import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import CountryFlag from 'react-native-country-flag';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useCountries } from '@/hooks/useCountries';
import { formatRate } from '@/lib/currency';

type TransferStatus = 'pending_verification' | 'confirmed' | 'paid_out' | 'failed';

interface Transfer {
  id: string;
  recipient_name: string;
  recipient_phone: string;
  from_country: string;
  to_country: string;
  amount_sent: number;
  amount_received: number;
  fee: number;
  status: TransferStatus;
  collection_reference: string;
  created_at: string;
}

const STATUS_STYLES: Record<TransferStatus, { light: string; dark: string; label: string }> = {
  pending_verification: { light: '#d97706', dark: '#fbbf24', label: 'Pending verification' },
  confirmed: { light: '#d97706', dark: '#fbbf24', label: 'Confirmed' },
  paid_out: { light: '#16a34a', dark: '#4ade80', label: 'Completed' },
  failed: { light: '#dc2626', dark: '#f87171', label: 'Failed' },
};

export default function TransactionDetailScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { getCountry } = useCountries();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('transfers')
      .select('id, recipient_name, recipient_phone, from_country, to_country, amount_sent, amount_received, fee, status, collection_reference, created_at')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setTransfer(data as Transfer);
        setLoading(false);
      });
  }, [id]);

  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark'
    : 'rounded-2xl bg-background-card border border-border-main';
  const rowClass = isDark
    ? 'flex-row items-center justify-between py-3 border-b border-border-main-dark'
    : 'flex-row items-center justify-between py-3 border-b border-border-main';
  const labelClass = isDark ? 'text-text-muted-dark text-sm' : 'text-text-muted text-sm';
  const valueClass = isDark ? 'text-text-main-dark font-semibold text-sm' : 'text-text-main font-semibold text-sm';

  if (loading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Transaction Details" />
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator />
        </View>
      </ScreenContainer>
    );
  }

  if (!transfer) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Transaction Details" />
        <View className="flex-1 items-center justify-center py-20">
          <Text className={isDark ? 'text-text-muted-dark' : 'text-text-muted'}>Transaction not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const toCountry = getCountry(transfer.to_country);
  const fromCountry = getCountry(transfer.from_country);
  const statusColor = isDark ? STATUS_STYLES[transfer.status].dark : STATUS_STYLES[transfer.status].light;
  const statusBg = isDark ? `${STATUS_STYLES[transfer.status].dark}22` : `${STATUS_STYLES[transfer.status].light}1a`;
  const reference = `TX-${transfer.id.slice(0, 8).toUpperCase()}`;

  const handleShare = (): void => {
    Share.share({
      message: `Transfer of ${formatRate(transfer.amount_received)} ${toCountry.currency_code} to ${transfer.recipient_name} — Ref: ${reference}`,
    });
  };

  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Transaction Details" />

      <View className="items-center mb-8 mt-2">
        {toCountry.code ? (
          <View style={{ marginBottom: 8, overflow: 'hidden', borderRadius: 6 }}>
            <CountryFlag isoCode={toCountry.code} size={40} />
          </View>
        ) : (
          <Text className="text-3xl mb-2">🏳️</Text>
        )}
        <Text className={isDark ? 'text-text-main-dark font-bold' : 'text-text-main font-bold'} style={{ fontSize: 30 }}>
          {formatRate(transfer.amount_received)} {toCountry.currency_code}
        </Text>
        <Text className={isDark ? 'text-text-muted-dark text-sm mt-1' : 'text-text-muted text-sm mt-1'}>
          to {transfer.recipient_name}
        </Text>
        <View className="flex-row items-center mt-3 px-3 py-1.5 rounded-full" style={{ backgroundColor: statusBg }}>
          <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: statusColor }} />
          <Text className="text-xs font-semibold" style={{ color: statusColor }}>
            {STATUS_STYLES[transfer.status].label}
          </Text>
        </View>
      </View>

      <View className={`${cardClass} px-4`}>
        <View className={rowClass}>
          <Text className={labelClass}>Recipient</Text>
          <Text className={valueClass}>{transfer.recipient_name}</Text>
        </View>
        <View className={rowClass}>
          <Text className={labelClass}>Date</Text>
          <Text className={valueClass}>{new Date(transfer.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</Text>
        </View>
        <View className={rowClass}>
          <Text className={labelClass}>Amount sent</Text>
          <Text className={valueClass}>{formatRate(transfer.amount_sent + transfer.fee)} {fromCountry.currency_code}</Text>
        </View>
        <View className={rowClass}>
          <Text className={labelClass}>Your transaction ID</Text>
          <Text className={valueClass}>{transfer.collection_reference}</Text>
        </View>
        <View className="flex-row items-center justify-between py-3">
          <Text className={labelClass}>Reference</Text>
          <Text className={valueClass}>{reference}</Text>
        </View>
      </View>

      <Pressable onPress={handleShare} className="flex-row items-center justify-center mt-6 py-2 active:opacity-70">
        <Feather name="share-2" size={16} color={isDark ? '#94a3b8' : '#64748b'} style={{ marginRight: 6 }} />
        <Text className={isDark ? 'text-text-muted-dark text-sm font-semibold' : 'text-text-muted text-sm font-semibold'}>
          Share Receipt
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}
