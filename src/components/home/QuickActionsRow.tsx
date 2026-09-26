import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ActionItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  primary?: boolean;
}

function ActionItem({ icon, label, onPress, primary }: ActionItemProps): React.JSX.Element {
  const { isDark } = useTheme();

  return (
    <Pressable onPress={onPress} className="items-center active:opacity-70" style={{ width: 72 }}>
      <View
        className={
          primary
            ? 'w-14 h-14 rounded-full items-center justify-center mb-2 bg-accent'
            : isDark
              ? 'w-14 h-14 rounded-full items-center justify-center mb-2 bg-background-card-dark border border-border-main-dark'
              : 'w-14 h-14 rounded-full items-center justify-center mb-2 bg-background-card border border-border-main'
        }
      >
        <Feather
          name={icon}
          size={20}
          color={primary ? '#1A1D24' : isDark ? '#94a3b8' : '#64748b'}
        />
      </View>
      <Text
        className={isDark ? 'text-text-main-dark text-xs font-medium' : 'text-text-main text-xs font-medium'}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function QuickActionsRow(): React.JSX.Element {
  const router = useRouter();

  return (
    <View className="flex-row justify-between px-6">
      <ActionItem
        icon="send"
        label="Send"
        primary
        onPress={() => router.push('/home/send' as never)}
      />
      <ActionItem
        icon="users"
        label="Add"
        onPress={() => router.push('/recipients/add-recipient' as never)}
      />
      <ActionItem
        icon="clock"
        label="Activity"
        onPress={() => router.push('/home/activity' as never)}
      />
    </View>
  );
}
