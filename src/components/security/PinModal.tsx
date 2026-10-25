import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppLock } from '@/contexts/AppLockContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCountdown } from '@/hooks/useCountdown';
import { useThemeColors } from '@/hooks/useThemeColors';
import { formatSeconds, isTooSimple } from '@/lib/appLock';

import PinPad from '@/components/security/PinPad';

interface PinModalProps {
  visible: boolean;
  mode: 'create' | 'verify';
  onClose: () => void;
  onSuccess: (pin: string) => void | Promise<void>;
}

export default function PinModal({ visible, mode, onClose, onSuccess }: PinModalProps): React.JSX.Element {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { checkPin } = useAppLock();

  const [stage, setStage] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const secondsLeft = useCountdown(lockedUntil);

  // Start fresh every time the popup opens
  useEffect(() => {
    if (visible) {
      setStage('enter');
      setFirstPin('');
      setError(null);
      setLockedUntil(null);
    }
  }, [visible]);

  const fail = (msg: string) => {
    Vibration.vibrate(150);
    setError(msg);
  };

  const handleComplete = async (pin: string) => {
    if (mode === 'verify') {
      const res = await checkPin(pin);
      if (res.ok) {
        await onSuccess(pin);
        return;
      }
      setLockedUntil(res.lockedUntil);
      fail(res.lockedUntil ? '' : t('lock.attempts_left', { count: res.attemptsLeft }));
      return;
    }

    if (stage === 'enter') {
      if (isTooSimple(pin)) return fail(t('lock.pin_too_simple'));
      setFirstPin(pin);
      setError(null);
      setStage('confirm');
      return;
    }

    if (pin !== firstPin) {
      setStage('enter');
      setFirstPin('');
      return fail(t('lock.pins_do_not_match'));
    }
    await onSuccess(pin);
  };

  const title =
    mode === 'verify' ? t('lock.verify_pin_title') : stage === 'enter' ? t('lock.create_pin_title') : t('lock.confirm_pin_title');
  const subtitle =
    mode === 'verify' ? t('lock.verify_pin_subtitle') : stage === 'enter' ? t('lock.create_pin_subtitle') : t('lock.confirm_pin_subtitle');
  const message = secondsLeft > 0 ? t('lock.locked_out', { time: formatSeconds(secondsLeft) }) : error;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: isDark ? '#0f172a' : '#f8fafc', paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }}>
        <View style={{ alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 24 }}>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('lock.close')}>
            <Feather name="x" size={24} color={colors.iconMuted} />
          </Pressable>
        </View>
        <PinPad title={title} subtitle={subtitle} error={message} disabled={secondsLeft > 0} onComplete={handleComplete} />
      </View>
    </Modal>
  );
}