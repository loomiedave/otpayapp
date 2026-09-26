import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

type KycStatus = 'pending' | 'approved' | 'rejected';

interface KycStatusBannerProps {
  status: KycStatus;
  rejectionReason: string | null;
}

const CONFIG: Record<KycStatus, { icon: keyof typeof Feather.glyphMap; color: string; title: string }> = {
  pending: { icon: 'clock', color: '#f59e0b', title: 'Your documents are under review, we will send you an email' },
  approved: { icon: 'check-circle', color: '#22c55e', title: 'Identity verified' },
  rejected: { icon: 'x-circle', color: '#ef4444', title: 'Submission rejected' },
};

export default function KycStatusBanner({ status, rejectionReason }: KycStatusBannerProps): React.JSX.Element {
  const { isDark } = useTheme();
  const { icon, color, title } = CONFIG[status];
  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark p-4'
    : 'rounded-2xl bg-background-card border border-border-main p-4';

  return (
    <View className={`${cardClass} flex-row items-start`} style={{ gap: 12 }}>
      <Feather name={icon} size={20} color={color} />
      <View className="flex-1">
        <Text className={isDark ? 'text-text-main-dark font-bold text-sm' : 'text-text-main font-bold text-sm'}>{title}</Text>
        {status === 'rejected' && rejectionReason ? (
          <Text className={isDark ? 'text-text-muted-dark text-xs mt-1' : 'text-text-muted text-xs mt-1'}>{rejectionReason}</Text>
        ) : null}
        {status === 'rejected' ? (
          <Text className={isDark ? 'text-text-muted-dark text-xs mt-2' : 'text-text-muted text-xs mt-2'}>You can resubmit below.</Text>
        ) : null}
      </View>
    </View>
  );
}
