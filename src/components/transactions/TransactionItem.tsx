import { useRouter } from 'expo-router';
import CountryFlag from 'react-native-country-flag';
import { View, Text, Pressable } from 'react-native';

import { formatRate } from '@/lib/currency';

import { formatDate } from '@/lib/helperFunctions';

import { useCountries } from '@/hooks/useCountries';

import { Transfer, TransferStatus } from '@/types/transactions';

type TransactionItemProps = {
  tx: Transfer;
  index: number;
  total: number;
  isDark: boolean;
};

const STATUS_STYLES: Record<TransferStatus, { light: string; dark: string; label: string }> = {
  pending_verification: { light: '#d97706', dark: '#fbbf24', label: 'Pending' },
  confirmed: { light: '#d97706', dark: '#fbbf24', label: 'Confirmed' },
  paid_out: { light: '#16a34a', dark: '#4ade80', label: 'Completed' },
  failed: { light: '#dc2626', dark: '#f87171', label: 'Failed' },
};

export default function TransactionItem({ tx, index, total, isDark, }: TransactionItemProps) {
  const router = useRouter();
  const { getCountry } = useCountries();

  const statusColor = isDark
    ? STATUS_STYLES[tx.status].dark
    : STATUS_STYLES[tx.status].light;

  const toCountry = getCountry(tx.to_country);

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/home/transaction-detail',
          params: { id: tx.id },
        })
      }
      className={`flex-row items-center py-4 active:opacity-70 ${
        index !== total - 1
          ? isDark
            ? 'border-b border-border-main-dark'
            : 'border-b border-border-main'
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
        {toCountry.code ? (
          <CountryFlag isoCode={toCountry.code} size={28} />
        ) : (
          <Text className="text-lg">🏳️</Text>
        )}
      </View>

      <View className="flex-1">
        <Text
          className={
            isDark
              ? 'text-text-main-dark font-bold text-base'
              : 'text-text-main font-bold text-base'
          }
        >
          {tx.recipient_name}
        </Text>

        <Text
          className={
            isDark
              ? 'text-text-muted-dark text-xs mt-0.5'
              : 'text-text-muted text-xs mt-0.5'
          }
        >
          {formatDate(tx.created_at)}
        </Text>
      </View>

      <View className="items-end">
        <Text
          className={
            isDark
              ? 'text-text-main-dark font-semibold text-sm'
              : 'text-text-main font-semibold text-sm'
          }
        >
          {formatRate(tx.amount_received)} {toCountry.currency_code}
        </Text>

        <View className="flex-row items-center mt-1">
          <View
            className="w-1.5 h-1.5 rounded-full mr-1"
            style={{ backgroundColor: statusColor }}
          />
          <Text
            className="text-xs font-medium"
            style={{ color: statusColor }}
          >
            {STATUS_STYLES[tx.status].label}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}