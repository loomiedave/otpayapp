import React, { useState } from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/ScreenContainer';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColors } from '@/hooks/useThemeColors';

interface MockDevice {
  id: string;
  name: string;
  lastActive: string;
}

// Hardcoded for now — will come from a sessions table once Supabase is wired up.
const MOCK_DEVICES: MockDevice[] = [
  { id: '1', name: 'iPhone 15 Pro', lastActive: 'Active now' },
  { id: '2', name: 'Chrome on MacBook', lastActive: 'Last active 2 days ago' },
];

export default function SecurityScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(true);
  const [pinEnabled, setPinEnabled] = useState<boolean>(false);

  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark'
    : 'rounded-2xl bg-background-card border border-border-main';

  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Security" />

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-3' : 'text-text-muted text-xs mb-3'}>
        LOGIN
      </Text>
      <View className={`${cardClass} mb-8`}>
        <View className="flex-row items-center justify-between p-4 border-b border-border-main dark:border-border-main-dark">
          <View className="flex-row items-center flex-1">
            <Feather name="smartphone" size={18} color={colors.primary} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className={isDark ? 'text-text-main-dark font-medium text-sm' : 'text-text-main font-medium text-sm'}>
                Biometric Login
              </Text>
              <Text className={isDark ? 'text-text-muted-dark text-xs mt-0.5' : 'text-text-muted text-xs mt-0.5'}>
                Use Face ID or fingerprint
              </Text>
            </View>
          </View>
          <Switch value={biometricEnabled} onValueChange={setBiometricEnabled} trackColor={{ true: colors.primary }} />
        </View>

        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center flex-1">
            <Feather name="hash" size={18} color={colors.primary} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className={isDark ? 'text-text-main-dark font-medium text-sm' : 'text-text-main font-medium text-sm'}>
                PIN Login
              </Text>
              <Text className={isDark ? 'text-text-muted-dark text-xs mt-0.5' : 'text-text-muted text-xs mt-0.5'}>
                Require a 4-digit PIN to open the app
              </Text>
            </View>
          </View>
          <Switch value={pinEnabled} onValueChange={setPinEnabled} trackColor={{ true: colors.primary }} />
        </View>
      </View>

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-3' : 'text-text-muted text-xs mb-3'}>
        ACCOUNT
      </Text>
      <Pressable className={`${cardClass} mb-8 flex-row items-center justify-between p-4 active:opacity-70`}>
        <View className="flex-row items-center">
          <Feather name="lock" size={18} color={colors.primary} style={{ marginRight: 12 }} />
          <Text className={isDark ? 'text-text-main-dark font-medium text-sm' : 'text-text-main font-medium text-sm'}>
            Change Password
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.iconMuted} />
      </Pressable>

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-3' : 'text-text-muted text-xs mb-3'}>
        ACTIVE DEVICES
      </Text>
      <View className={cardClass}>
        {MOCK_DEVICES.map((device, index) => (
          <View
            key={device.id}
            className={`flex-row items-center p-4 ${
              index !== MOCK_DEVICES.length - 1
                ? isDark
                  ? 'border-b border-border-main-dark'
                  : 'border-b border-border-main'
                : ''
            }`}
          >
            <Feather name="monitor" size={18} color={colors.iconMuted} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className={isDark ? 'text-text-main-dark font-medium text-sm' : 'text-text-main font-medium text-sm'}>
                {device.name}
              </Text>
              <Text className={isDark ? 'text-text-muted-dark text-xs mt-0.5' : 'text-text-muted text-xs mt-0.5'}>
                {device.lastActive}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}
