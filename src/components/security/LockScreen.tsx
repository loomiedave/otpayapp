import React, { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Modal, Pressable, Text, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { formatSeconds } from '@/lib/appLock';
import { useAppLock } from '@/contexts/AppLockContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCountdown } from '@/hooks/useCountdown';
import { useThemeColors } from '@/hooks/useThemeColors';

import Button from '@/components/ui/Button';
import PinPad from '@/components/security/PinPad';

export default function LockScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { locked, settings, unlockWithPin, unlockWithBiometric, resetAndSignOut } = useAppLock();

  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const secondsLeft = useCountdown(lockedUntil);

  useEffect(() => {
    if (!locked) {
      setError(null);
      setLockedUntil(null);
    }
  }, [locked]);

  // Open the fingerprint / Face ID prompt automatically (short delay so the screen shows first)
  useEffect(() => {
    if (!locked || !settings.biometricEnabled) return;
    let active = true;
    const timer = setTimeout(() => { if (active) unlockWithBiometric(); }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [locked, settings.biometricEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = async (pin: string) => {
    const res = await unlockWithPin(pin);
    if (res.ok) return;
    Vibration.vibrate(150);
    setLockedUntil(res.lockedUntil);
    setError(res.lockedUntil ? null : t('lock.attempts_left', { count: res.attemptsLeft }));
  };

  const handleForgot = () =>
    Alert.alert(t('lock.forgot_pin_confirm_title'), t('lock.forgot_pin_confirm_message'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.sign_out'), style: 'destructive', onPress: () => { resetAndSignOut(); } },
    ]);

  const message = secondsLeft > 0 ? t('lock.locked_out', { time: formatSeconds(secondsLeft) }) : error;
  const linkClass = 'text-blue-500 underline text-sm';

  return (
    <Modal visible={locked} animationType="none" presentationStyle="fullScreen" statusBarTranslucent onRequestClose={() => {}}>
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
          paddingTop: insets.top + 56,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {settings.pinEnabled ? (
          <PinPad
            title={t('lock.enter_pin_title')}
            error={message}
            disabled={secondsLeft > 0}
            onComplete={handleComplete}
            onBiometric={settings.biometricEnabled ? () => { unlockWithBiometric(); } : undefined}
            footer={
              <Pressable onPress={handleForgot} hitSlop={10}>
                <Text className={linkClass}>{t('lock.forgot_pin')}</Text>
              </Pressable>
            }
          />
        ) : (
          // Biometric only (no PIN): one big unlock button
          <View className="flex-1 items-center px-8">
            <MaterialCommunityIcons name="fingerprint" size={72} color={colors.primary} />
            <Text className={isDark ? 'text-text-main-dark text-2xl font-bold text-center mt-6' : 'text-text-main text-2xl font-bold text-center mt-6'}>
              {t('lock.locked_title')}
            </Text>
            <Text className={isDark ? 'text-text-muted-dark text-sm text-center mt-2 mb-8' : 'text-text-muted text-sm text-center mt-2 mb-8'}>
              {t('lock.locked_subtitle')}
            </Text>
            <View style={{ alignSelf: 'stretch' }}>
              <Button label={t('lock.unlock_biometric')} onPress={() => { unlockWithBiometric(); }} />
            </View>
            <Pressable onPress={handleForgot} hitSlop={10} style={{ marginTop: 24 }}>
              <Text className={linkClass}>{t('settings.sign_out')}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}