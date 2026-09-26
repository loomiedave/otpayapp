// components/home/RecentTransactions.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';

type TransactionType = 'sent' | 'received';
type TransactionStatus = 'completed' | 'pending';

interface Transaction {
  id: string;
  name: string;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
  amount: number;
  currency: string;
}

const DUMMY_TRANSACTIONS: Transaction[] = [
  { id: '1', name: 'Amara Okafor', type: 'sent', status: 'completed', date: 'Today, 2:41 PM', amount: 120.0, currency: 'USD' },
  { id: '2', name: 'Kwame Mensah', type: 'received', status: 'completed', date: 'Today, 9:15 AM', amount: 75.5, currency: 'EUR' },
  { id: '3', name: 'Fatou Diallo', type: 'sent', status: 'pending', date: 'Yesterday', amount: 40.0, currency: 'GBP' },
  { id: '4', name: 'Yusuf Ibrahim', type: 'received', status: 'completed', date: 'Mon, Aug 11', amount: 310.25, currency: 'USD' },
];

function formatAmount(amount: number, currency: string, type: TransactionType): string {
  const sign = type === 'received' ? '+' : '-';
  return `${sign}${currency} ${amount.toFixed(2)}`;
}

function TransactionRow({ tx, isDark }: { tx: Transaction; isDark: boolean }): React.JSX.Element {
  const isReceived = tx.type === 'received';

  return (
    <View className="flex-row items-center py-3">
      <View
        className={
          isReceived
            ? 'w-11 h-11 rounded-full items-center justify-center bg-emerald-500/15'
            : 'w-11 h-11 rounded-full items-center justify-center bg-orange-500/15'
        }
      >
        {isReceived ? (
          <Feather name="arrow-down-left" size={20} color="#10B981" />
        ) : (
          <Feather name="arrow-up-right" size={20} color="#F97316" />
        )}
      </View>

      <View className="flex-1 ml-3">
        <Text
          className={isDark ? 'text-text-main-dark font-semibold text-sm' : 'text-text-main font-semibold text-sm'}
          numberOfLines={1}
        >
          {tx.name}
        </Text>
        <Text className={isDark ? 'text-text-muted-dark text-xs mt-0.5' : 'text-text-muted text-xs mt-0.5'}>
          {tx.date}
        </Text>
      </View>

      <View className="items-end">
        <Text
          className={
            isReceived
              ? 'text-emerald-500 font-bold text-sm'
              : isDark
              ? 'text-text-main-dark font-bold text-sm'
              : 'text-text-main font-bold text-sm'
          }
        >
          {formatAmount(tx.amount, tx.currency, tx.type)}
        </Text>
        {tx.status === 'pending' && (
          <View className="bg-amber-500/15 px-2 py-0.5 rounded-full mt-1">
            <Text className="text-amber-500 text-[10px] font-semibold">Pending</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function RecentTransactions(): React.JSX.Element {
  const { isDark } = useTheme();

  return (
    <View className="px-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className={isDark ? 'text-text-main-dark font-bold text-lg' : 'text-text-main font-bold text-lg'}>
          Recent Transactions
        </Text>
        <Pressable onPress={() => {}}>
          <Text className="text-primary font-semibold text-sm">See all</Text>
        </Pressable>
      </View>

      <View
        className={
          isDark
            ? 'bg-slate-800 rounded-3xl px-4 shadow-sm'
            : 'bg-white rounded-3xl px-4 shadow-sm'
        }
      >
        {DUMMY_TRANSACTIONS.map((tx, index) => (
          <React.Fragment key={tx.id}>
            <TransactionRow tx={tx} isDark={isDark} />
            {index < DUMMY_TRANSACTIONS.length - 1 && (
              <View className={isDark ? 'h-px bg-slate-700' : 'h-px bg-slate-100'} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}
