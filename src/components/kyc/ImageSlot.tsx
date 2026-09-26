import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface ImageSlotProps {
  uri: string | null;
  label: string;
  onPress: () => void;
}

export default function ImageSlot({ uri, label, onPress }: ImageSlotProps): React.JSX.Element {
  const { isDark } = useTheme();
  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark'
    : 'rounded-2xl bg-background-card border border-border-main';

  return (
    <Pressable onPress={onPress} className={`${cardClass} p-4 items-center justify-center`} style={{ height: 110 }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
      ) : (
        <>
          <Feather name="camera" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
          <Text className={isDark ? 'text-text-muted-dark text-xs mt-2' : 'text-text-muted text-xs mt-2'}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
