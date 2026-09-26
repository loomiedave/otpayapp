import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { COUNTRIES, ALL_COUNTRY_CODES, CountryCode } from '@/constants/countries';

interface CountryPickerModalProps {
  visible: boolean;
  onSelect: (code: CountryCode) => void;
  onClose: () => void;
}

export default function CountryPickerModal({ visible, onSelect, onClose }: CountryPickerModalProps): React.JSX.Element {
  const { isDark } = useTheme();
  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark'
    : 'rounded-2xl bg-background-card border border-border-main';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} onPress={onClose}>
        <View className={cardClass} style={{ width: '85%', padding: 8 }}>
          {ALL_COUNTRY_CODES.map((code) => (
            <Pressable key={code} onPress={() => { onSelect(code); onClose(); }} className="flex-row items-center px-4 py-3.5">
              <Text className="text-base mr-2">{COUNTRIES[code].flag}</Text>
              <Text className={isDark ? 'text-text-main-dark text-sm' : 'text-text-main text-sm'}>{COUNTRIES[code].name}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}
