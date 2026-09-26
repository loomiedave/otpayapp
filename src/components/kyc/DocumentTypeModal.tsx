import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type DocumentType = 'passport' | 'national_id' | 'drivers_license' | 'voters_card';

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  passport: 'Passport',
  national_id: 'National ID',
  drivers_license: "Driver's License",
  voters_card: "Voter's Card",
};

export const DOCUMENT_TYPES: DocumentType[] = ['passport', 'national_id', 'drivers_license', 'voters_card'];
export const requiresBack = (type: DocumentType): boolean => type !== 'passport';

interface DocumentTypeModalProps {
  visible: boolean;
  onSelect: (type: DocumentType) => void;
  onClose: () => void;
}

export default function DocumentTypeModal({ visible, onSelect, onClose }: DocumentTypeModalProps): React.JSX.Element {
  const { isDark } = useTheme();
  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark'
    : 'rounded-2xl bg-background-card border border-border-main';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} onPress={onClose}>
        <View className={cardClass} style={{ width: '85%', padding: 8 }}>
          {DOCUMENT_TYPES.map((type) => (
            <Pressable key={type} onPress={() => { onSelect(type); onClose(); }} className="px-4 py-3.5">
              <Text className={isDark ? 'text-text-main-dark text-sm' : 'text-text-main text-sm'}>{DOCUMENT_LABELS[type]}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}
