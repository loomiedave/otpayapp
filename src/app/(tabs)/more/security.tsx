import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View, Text, Switch, Alert } from 'react-native';

import { useAppLock } from '@/contexts/AppLockContext';
import { useTheme } from '@/contexts/ThemeContext';

import { useThemeColors } from '@/hooks/useThemeColors';

import PinModal from '@/components/security/PinModal';
import ScreenHeader from '@/components/ui/ScreenHeader';
import ScreenContainer from '@/components/ui/ScreenContainer';

type PinFlow = null | 'enable-pin' | 'disable-pin' | 'disable-biometric';

export default function SecurityScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const { settings, enablePin, disablePin, enableBiometric, disableBiometric, authenticateBiometric } = useAppLock();
  const [flow, setFlow] = useState<PinFlow>(null);

  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark'
    : 'rounded-2xl bg-background-card border border-border-main';

  const handleTogglePin = (next: boolean) => setFlow(next ? 'enable-pin' : 'disable-pin');

  const handleToggleBiometric = async (next: boolean) => {
    if (next) {
      const result = await enableBiometric();
      if (result === 'unavailable') Alert.alert(t('common.error_title'), t('security.biometric_unavailable'));
      else if (result === 'not_enrolled') Alert.alert(t('common.error_title'), t('security.biometric_not_enrolled'));
      else if (result === 'failed') Alert.alert(t('common.error_title'), t('security.biometric_failed'));
      return;
    }
    if (settings.pinEnabled) {
      setFlow('disable-biometric');
      return;
    }
    const res = await authenticateBiometric(t('security.biometric_prompt_disable'), true);
    const cannotVerify = !res.success && ['not_enrolled', 'passcode_not_set', 'not_available'].includes(res.error ?? '');
    if (res.success || cannotVerify) await disableBiometric();
  };

  const handlePinSuccess = async (pin: string) => {
    const current = flow;
    setFlow(null);
    if (current === 'enable-pin') await enablePin(pin);
    else if (current === 'disable-pin') await disablePin();
    else if (current === 'disable-biometric') await disableBiometric();
  };

  const rowText = isDark ? 'text-text-main-dark font-medium text-sm' : 'text-text-main font-medium text-sm';
  const subText = isDark ? 'text-text-muted-dark text-xs mt-0.5' : 'text-text-muted text-xs mt-0.5';

  return (
    <ScreenContainer scroll>
      <ScreenHeader title={t('security.title')} />

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-3' : 'text-text-muted text-xs mb-3'}>
        {t('security.login').toUpperCase()}
      </Text>
      <View className={cardClass}>
        <View className="flex-row items-center justify-between p-4 border-b border-border-main dark:border-border-main-dark">
          <View className="flex-row items-center flex-1">
            <Feather name="smartphone" size={18} color={colors.primary} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className={rowText}>{t('security.biometric_login')}</Text>
              <Text className={subText}>{t('security.biometric_subtitle')}</Text>
            </View>
          </View>
          <Switch value={settings.biometricEnabled} onValueChange={handleToggleBiometric} trackColor={{ true: colors.primary }} />
        </View>

        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center flex-1">
            <Feather name="hash" size={18} color={colors.primary} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className={rowText}>{t('security.pin_login')}</Text>
              <Text className={subText}>{t('security.pin_subtitle')}</Text>
            </View>
          </View>
          <Switch value={settings.pinEnabled} onValueChange={handleTogglePin} trackColor={{ true: colors.primary }} />
        </View>
      </View>

      <Text className={isDark ? 'text-text-muted-dark text-xs mt-3' : 'text-text-muted text-xs mt-3'}>
        {t('security.lock_hint')}
      </Text>

      <PinModal
        visible={flow !== null}
        mode={flow === 'enable-pin' ? 'create' : 'verify'}
        onClose={() => setFlow(null)}
        onSuccess={handlePinSuccess}
      />
    </ScreenContainer>
  );
}