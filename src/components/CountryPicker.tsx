import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, findNodeHandle, UIManager } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮' },
];

interface CountryPickerProps {
  selected: Country;
  onSelect: (country: Country) => void;
}

interface AnchorPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CountryPicker({ selected, onSelect }: CountryPickerProps): React.JSX.Element {
  const [visible, setVisible] = useState<boolean>(false);
  const [anchor, setAnchor] = useState<AnchorPosition | null>(null);
  const triggerRef = useRef<View>(null);
  const colors = useThemeColors();

  const openPicker = (): void => {
    const node = findNodeHandle(triggerRef.current);
    if (node) {
      UIManager.measureInWindow(node, (x, y, width, height) => {
        setAnchor({ x, y, width, height });
        setVisible(true);
      });
    }
  };

  const handleSelect = (country: Country): void => {
    onSelect(country);
    setVisible(false);
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        className="flex-row items-center pr-3 mr-3 border-r border-border-main"
        onPress={openPicker}
      >
        <Text className="text-base mr-1.5">{selected.flag}</Text>
        <Text className="text-text-main font-bold text-base mr-1">{selected.dialCode}</Text>
        <Feather name="chevron-down" size={16} color={colors.iconMuted} />
      </Pressable>

      <Modal visible={visible} animationType="fade" transparent onRequestClose={() => setVisible(false)}>
        <Pressable className="flex-1" onPress={() => setVisible(false)}>
          {anchor && (
            <View
              className="absolute bg-background-card rounded-2xl border border-border-main shadow-lg overflow-hidden"
              style={{ top: anchor.y + anchor.height + 6, left: anchor.x, width: 210 }}
            >
              <FlatList
                data={COUNTRIES}
                keyExtractor={(item) => item.code}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <Pressable
                    className={`flex-row items-center px-3.5 py-3 active:opacity-70 ${
                      index !== COUNTRIES.length - 1 ? 'border-b border-border-main' : ''
                    }`}
                    onPress={() => handleSelect(item)}
                  >
                    <Text className="text-base mr-2.5">{item.flag}</Text>
                    <Text className="flex-1 text-text-main font-medium text-sm">{item.name}</Text>
                    <Text className="text-text-muted font-medium text-xs mr-2">{item.dialCode}</Text>
                    {item.code === selected.code && <Feather name="check" size={15} color={colors.primary} />}
                  </Pressable>
                )}
              />
            </View>
          )}
        </Pressable>
      </Modal>
    </>
  );
}
