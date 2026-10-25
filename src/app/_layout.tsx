import '../../i18n';
import './global.css';

import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { ThemeProvider as NavigationThemeProvider, DefaultTheme, DarkTheme } from 'expo-router/react-navigation';

import { useHasLaunched } from '@/lib/onboardingStore';

import LockScreen from '@/components/security/LockScreen';

import { AppLockProvider, useAppLock } from '@/contexts/AppLockContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ExchangeRatesProvider } from '@/contexts/ExchangeRatesContext';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/contexts/ThemeContext';

if (Platform.OS === 'web') {
  enableScreens(false);
}

SplashScreen.preventAutoHideAsync();
configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

function RootNavigator(): React.JSX.Element | null {
  const { isDark } = useTheme();
  const hasLaunched = useHasLaunched();
  const { ready: lockReady } = useAppLock();
  const { session, isLoading: authLoading } = useAuth();

  const backgroundColor = isDark ? '#0f172a' : '#f8fafc';
  const AppTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: { ...(isDark ? DarkTheme.colors : DefaultTheme.colors), background: backgroundColor },
  };

  useEffect(() => {
    if (authLoading || hasLaunched === null || !lockReady) return;
    SplashScreen.hideAsync();
  }, [authLoading, hasLaunched, lockReady]);

  if (authLoading || hasLaunched === null || !lockReady) return null;

  return (
    <NavigationThemeProvider value={AppTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: { backgroundColor },
        }}
      >
        <Stack.Protected guard={!hasLaunched}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>

        <Stack.Protected guard={hasLaunched && !session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={hasLaunched && !!session}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <AuthProvider>
        <AppLockProvider>
          <ExchangeRatesProvider>
            <RootNavigator />
          </ExchangeRatesProvider>
          <LockScreen />
          </AppLockProvider>
        </AuthProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
