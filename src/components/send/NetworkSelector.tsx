import React from 'react';
import { View, Text, Pressable } from 'react-native';

const ACCENT_GOLD = '#D4A62B';

export type Network = 'mtn' | 'flooz' | 'tmoney';

const NETWORK_OPTIONS: Record<string, { value: Network; label: string }[]> = {
  GH: [{ value: 'mtn', label: 'MTN' }],
  TG: [
    { value: 'flooz', label: 'Flooz' },
    { value: 'tmoney', label: 'T-Money' },
  ],
};

export function getRequiredNetwork(country: string | null): { value: Network; label: string }[] | null {
  if (!country) return null;
  return NETWORK_OPTIONS[country] ?? null;
}

interface NetworkSelectorProps {
  toCountry: string | null;
  network: Network | null;
  setNetwork: (n: Network) => void;
  cardClass: string;
  isDark: boolean;
  t: (key: string) => string;
}

export default function NetworkSelector({ toCountry, network, setNetwork, cardClass, isDark, t }: NetworkSelectorProps): React.JSX.Element | null {
  const options = getRequiredNetwork(toCountry);
  if (!options || options.length <= 1) return null; // nothing to choose (e.g. GH has only MTN, auto-selected)

  return (
    <View className="mt-4">
      <Text className={isDark ? 'text-text-muted-dark text-xs mb-2' : 'text-text-muted text-xs mb-2'}>{t('send.selectNetwork')}</Text>
      <View className="flex-row" style={{ gap: 12 }}>
        {options.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setNetwork(opt.value)}
            className={`${cardClass} px-4 py-2`}
            style={{
              borderColor: network === opt.value ? ACCENT_GOLD : undefined,
              borderWidth: network === opt.value ? 2 : 1,
            }}
          >
            <Text className={isDark ? 'text-text-main-dark' : 'text-text-main'}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
