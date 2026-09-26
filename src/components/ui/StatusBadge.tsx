import React from 'react';
import { View, Text } from 'react-native';

type TransactionStatus = 'pending' | 'processing' | 'confirmed' | 'failed';

interface StatusBadgeProps {
  status: TransactionStatus;
}

const STATUS_CONFIG: Record<TransactionStatus, { label: string; className: string; textClassName: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/10', textClassName: 'text-warning' },
  processing: { label: 'Processing', className: 'bg-primary/10', textClassName: 'text-primary' },
  confirmed: { label: 'Confirmed', className: 'bg-success/10', textClassName: 'text-success' },
  failed: { label: 'Failed', className: 'bg-danger/10', textClassName: 'text-danger' },
};

export default function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element {
  const config = STATUS_CONFIG[status];

  return (
    <View className={`flex-row items-center px-2.5 py-1 rounded-full self-start ${config.className}`}>
      <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.textClassName.replace('text-', 'bg-')}`} />
      <Text className={`text-xs font-semibold ${config.textClassName}`}>{config.label}</Text>
    </View>
  );
}
