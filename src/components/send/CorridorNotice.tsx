import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CorridorNoticeProps {
  show: boolean;
  fromCountry: string;
  toCountry: string | null;
  getCountry: (code: string) => { code: string; name: string; currency_code: string };
  isDark: boolean;
  t: (key: string, opts?: Record<string, unknown>) => string;
  cardClass: string;
}

export default function CorridorNotice({ show, fromCountry, toCountry, getCountry, isDark, t, cardClass }: CorridorNoticeProps): React.JSX.Element | null {
  if (!show || !toCountry) return null;
  return (
    <View className={`${cardClass} mt-4 p-4 flex-row items-center`}>
      <Feather name="clock" size={14} color={isDark ? '#94a3b8' : '#64748b'} />
      <Text className={isDark ? 'text-text-muted-dark text-xs ml-2 flex-1' : 'text-text-muted text-xs ml-2 flex-1'}>
        {t('send.corridorInactive', { from: getCountry(fromCountry).name, to: getCountry(toCountry).name })}
      </Text>
    </View>
  );
}
