import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { resetLaunched } from '@/lib/onboardingStore';

interface MenuItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'details', icon: 'user', title: 'Personal Details', subtitle: 'Manage your personal information', route: '/profile/details' },
  { id: 'security', icon: 'shield', title: 'Security', subtitle: 'PIN, biometrics, devices', route: '/profile/security' },
  { id: 'live', icon: 'message-circle', title: 'Live Chat', subtitle: 'Talk to our support team', route: '/profile/live-chat' },
  { id: 'support', icon: 'help-circle', title: 'Help & Contact', subtitle: 'read FAQs, email and call us', route: '/profile/support' },
  { id: 'settings', icon: 'settings', title: 'Settings', subtitle: 'Appearance, notifications, security', route: '/profile/settings' },
];

export default function ProfileScreen(): React.JSX.Element {
  const colors = useThemeColors();
  const { isDark } = useTheme();
  const { session, signOut } = useAuth();

  const userEmail = session?.user?.email ?? '';
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    supabase
      .from('kyc_submissions')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => setVerified(data?.status === 'approved'));
  }, [session?.user?.id]);

  const handleSignOut = async (): Promise<void> => {
    await signOut();
  };

  const handleResetApp = async (): Promise<void> => {
    await signOut();
    await AsyncStorage.clear();
    await resetLaunched();
  };

  return (
    <ScreenContainer scroll paddingHorizontal={false}>
      <View className="items-center pt-4 pb-5">
        <View className="relative mb-2">
          <View className="w-14 h-14 rounded-full bg-primary items-center justify-center">
            <Text className="text-white font-bold text-lg">{userEmail.charAt(0).toUpperCase()}</Text>
          </View>
          {verified && (
            <View
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full items-center justify-center border-2"
              style={{ backgroundColor: '#22c55e', borderColor: isDark ? '#0a0a0a' : '#ffffff' }}
            >
              <Feather name="check" size={10} color="#fff" />
            </View>
          )}
        </View>
        <Text className={isDark ? 'text-text-main-dark text-sm font-medium' : 'text-text-main text-sm font-medium'}>
          {userEmail}
        </Text>
      </View>

      <View className="px-5">
        {MENU_ITEMS.map((item, index) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(item.route as never)}
            className={`flex-row items-center py-3 active:opacity-70 ${
              index !== MENU_ITEMS.length - 1
                ? isDark
                  ? 'border-b border-border-main-dark'
                  : 'border-b border-border-main'
                : ''
            }`}
          >
            <View
              className={
                isDark
                  ? 'w-9 h-9 rounded-full items-center justify-center mr-3'
                  : 'w-9 h-9 rounded-full items-center justify-center mr-3'
              }
            >
              <Feather name={item.icon} size={16} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className={isDark ? 'text-text-main-dark font-semibold text-sm' : 'text-text-main font-semibold text-sm'}>
                {item.title}
              </Text>
              <Text className={isDark ? 'text-text-muted-dark text-xs mt-0.5' : 'text-text-muted text-xs mt-0.5'}>
                {item.subtitle}
              </Text>
            </View>
           {/*  <Feather name="chevron-right" size={16} color={colors.iconMuted} /> */}
          </Pressable>
        ))}

        <Pressable onPress={handleSignOut} className="flex-row items-center py-3 mt-1 active:opacity-70">
          <View
            className={
              isDark
                ? 'w-9 h-9 rounded-full bg-background-card-dark items-center justify-center mr-3'
                : 'w-9 h-9 rounded-full bg-background-card items-center justify-center mr-3'
            }
          >
            <Feather name="log-out" size={16} color={colors.danger} />
          </View>
          <Text className="font-semibold text-sm" style={{ color: colors.danger }}>
            Sign Out
          </Text>
        </Pressable>

        {__DEV__ && (
          <Pressable
            onPress={handleResetApp}
            className={
              isDark
                ? 'flex-row items-center py-2.5 mt-4 px-3 rounded-xl border border-dashed border-border-main-dark active:opacity-70'
                : 'flex-row items-center py-2.5 mt-4 px-3 rounded-xl border border-dashed border-border-main active:opacity-70'
            }
          >
            <Feather name="refresh-ccw" size={14} color={colors.iconMuted} style={{ marginRight: 8 }} />
            <Text className={isDark ? 'text-text-muted-dark text-xs' : 'text-text-muted text-xs'}>
              Dev: Reset app & show onboarding
            </Text>
          </Pressable>
        )}
      </View>
    </ScreenContainer>
  );
}
