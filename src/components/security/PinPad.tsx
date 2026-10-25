import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { PIN_LENGTH } from '@/lib/appLock';

interface PinPadProps {
  title: string;
  subtitle?: string;
  error?: string | null;
  disabled?: boolean; // true during a lockout
  onComplete: (pin: string) => void | Promise<void>; // called when the last digit is typed
  onBiometric?: () => void; // shows the fingerprint key when given
  footer?: React.ReactNode;
}

const KEY_SIZE = 76; // CHANGED: size of the tap circle behind each number

function Key({
  label, icon, a11y, onPress, isDark, iconColor,
}: {
  label?: string;
  icon?: 'fingerprint' | 'backspace';
  a11y?: string;
  onPress: () => void;
  isDark: boolean;
  iconColor: string;
}) {
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const pressedBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)';

  return (
    // CHANGED: no className and no function style on the Pressable anymore (that was the bug).
    // It only takes one equal slice of the row (flex: 1) and centers the circle.
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y ?? label}
      style={{ flex: 1, alignItems: 'center' }}
    >
      {({ pressed }) => (
        // CHANGED: the size and the "pressed" circle now live in a plain View with inline styles
        <View
          style={{
            width: KEY_SIZE,
            height: KEY_SIZE,
            borderRadius: KEY_SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? pressedBg : 'transparent', // CHANGED: no box until pressed
          }}
        >
          {label ? (
            <Text style={{ color: textColor, fontSize: 32, fontWeight: '500' }}>{label}</Text>
          ) : icon === 'fingerprint' ? (
            <MaterialCommunityIcons name="fingerprint" size={32} color={iconColor} />
          ) : (
            <Feather name="delete" size={24} color={iconColor} />
          )}
        </View>
      )}
    </Pressable>
  );
}

export default function PinPad({ title, subtitle, error, disabled, onComplete, onBiometric, footer }: PinPadProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const colors = useThemeColors();

  const [digits, setDigits] = useState('');
  const digitsRef = useRef('');
  const busy = useRef(false);

  const update = (v: string) => { digitsRef.current = v; setDigits(v); };

  const press = async (d: string) => {
    if (disabled || busy.current || digitsRef.current.length >= PIN_LENGTH) return;
    const next = digitsRef.current + d;
    update(next);
    if (next.length === PIN_LENGTH) {
      busy.current = true;
      try {
        await onComplete(next);
      } finally {
        busy.current = false;
        update(''); // always start empty again (the parent shows the error)
      }
    }
  };

  const backspace = () => {
    if (!busy.current) update(digitsRef.current.slice(0, -1));
  };

  const rows = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']];
  // CHANGED: every row has the same width, so the 3 columns line up perfectly
  const rowStyle = { flexDirection: 'row' as const, width: '100%' as const, maxWidth: 330, marginTop: 8 };

  return (
    // CHANGED: the whole pad stretches the full height: text on top, keypad at the bottom
    <View style={{ flex: 1, width: '100%', alignItems: 'center', paddingHorizontal: 24 }}>
      <View style={{ alignItems: 'center' }}>
        <Text className={isDark ? 'text-text-main-dark text-2xl font-bold text-center' : 'text-text-main text-2xl font-bold text-center'}>
          {title}
        </Text>
        {subtitle ? (
          <Text className={isDark ? 'text-text-muted-dark text-sm text-center mt-2' : 'text-text-muted text-sm text-center mt-2'}>
            {subtitle}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 18, marginTop: 36, marginBottom: 14 }}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: colors.primary,
                backgroundColor: i < digits.length ? colors.primary : 'transparent',
              }}
            />
          ))}
        </View>

        <Text style={{ minHeight: 36, color: '#ef4444', fontSize: 13, textAlign: 'center' }}>{error ?? ' '}</Text>
      </View>

      {/* CHANGED: invisible spacer that pushes the keypad down to the bottom */}
      <View style={{ flex: 1 }} />

      {rows.map((row) => (
        <View key={row[0]} style={rowStyle}>
          {row.map((d) => (
            <Key key={d} label={d} onPress={() => press(d)} isDark={isDark} iconColor={colors.primary} />
          ))}
        </View>
      ))}

      <View style={rowStyle}>
        {onBiometric ? (
          <Key icon="fingerprint" a11y={t('lock.use_biometric')} onPress={onBiometric} isDark={isDark} iconColor={colors.primary} />
        ) : (
          <View style={{ flex: 1 }} /> // empty slot keeps the 0 centered
        )}
        <Key label="0" onPress={() => press('0')} isDark={isDark} iconColor={colors.primary} />
        <Key icon="backspace" a11y={t('lock.delete')} onPress={backspace} isDark={isDark} iconColor={colors.iconMuted} />
      </View>

      {footer ? <View style={{ marginTop: 24 }}>{footer}</View> : null}
    </View>
  );
}