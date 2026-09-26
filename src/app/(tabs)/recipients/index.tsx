import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface MockRecipient {
  id: string;
  name: string;
  flag: string;
  detail: string;
}

// Hardcoded for now — will come from the recipients table once Supabase is wired up.
const MOCK_RECIPIENTS: MockRecipient[] = [
  { id: '1', name: 'Ama Boateng', flag: '🇬🇭', detail: 'MTN Mobile Money · Ghana' },
  { id: '2', name: 'Chidi Okafor', flag: '🇳🇬', detail: 'GTBank · Nigeria' },
  { id: '3', name: 'Fatou Diallo', flag: '🌍', detail: 'Wave · Togo' },
  { id: '4', name: 'Kojo Mensah', flag: '🇬🇭', detail: 'Vodafone Cash · Ghana' },
  { id: '5', name: 'Ngozi Adeyemi', flag: '🇳🇬', detail: 'Access Bank · Nigeria' },
];

export default function RecipientsScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const colors = useThemeColors();

  return (
      <ScreenContainer scroll>
        <ScreenHeader title="Recipients" />
        <Pressable
          onPress={() => router.push('/recipients/add-recipient')}
          className={
            isDark
              ? 'flex-row items-center p-4 rounded-2xl border border-dashed border-border-main-dark mb-6 active:opacity-70'
              : 'flex-row items-center p-4 rounded-2xl border border-dashed border-border-main mb-6 active:opacity-70'
          }
        >
          <View
            className={
              isDark
                ? 'w-10 h-10 rounded-full bg-background-card-dark items-center justify-center mr-3'
                : 'w-10 h-10 rounded-full bg-background-card items-center justify-center mr-3'
            }
          >
            <Feather name="plus" size={18} color={colors.primary} />
          </View>
          <Text className={isDark ? 'text-text-main-dark font-semibold' : 'text-text-main font-semibold'}>
            Add New Recipient
          </Text>
        </Pressable>

        {MOCK_RECIPIENTS.length === 0 ? (
          <View className="items-center justify-center py-16">
            <View
              className={
                isDark
                  ? 'w-16 h-16 rounded-full bg-background-card-dark items-center justify-center mb-4'
                  : 'w-16 h-16 rounded-full bg-background-card items-center justify-center mb-4'
              }
            >
              <Feather name="users" size={26} color={colors.iconMuted} />
            </View>
            <Text
              className={
                isDark ? 'text-text-main-dark font-bold text-base mb-1' : 'text-text-main font-bold text-base mb-1'
              }
            >
              No recipients yet
            </Text>
            <Text
              className={
                isDark ? 'text-text-muted-dark text-sm text-center px-8' : 'text-text-muted text-sm text-center px-8'
              }
            >
              Add someone to start sending money across borders.
            </Text>
          </View>
        ) : (
          MOCK_RECIPIENTS.map((r, index) => (
            <Pressable
              key={r.id}
              onPress={() => router.push('/home/send')}
              className={`flex-row items-center py-4 active:opacity-70 ${
                index !== MOCK_RECIPIENTS.length - 1
                  ? isDark
                    ? 'border-b border-border-main-dark'
                    : 'border-b border-border-main'
                  : ''
              }`}
            >
              <View
                className={
                  isDark
                    ? 'w-11 h-11 rounded-full bg-background-card-dark items-center justify-center mr-4'
                    : 'w-11 h-11 rounded-full bg-background-card items-center justify-center mr-4'
                }
              >
                <Text className="text-lg">{r.flag}</Text>
              </View>
              <View className="flex-1">
                <Text className={isDark ? 'text-text-main-dark font-bold text-base' : 'text-text-main font-bold text-base'}>
                  {r.name}
                </Text>
                <Text className={isDark ? 'text-text-muted-dark text-sm mt-0.5' : 'text-text-muted text-sm mt-0.5'}>
                  {r.detail}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.iconMuted} />
            </Pressable>
          ))
        )}
      </ScreenContainer>
    );
}
