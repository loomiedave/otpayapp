import { Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';

import '../../i18n';
import './global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider as NavigationThemeProvider, DefaultTheme, DarkTheme } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { ThemeProvider as AppThemeProvider, useTheme } from '../contexts/ThemeContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ExchangeRatesProvider } from '@/contexts/ExchangeRatesContext';
import { useHasLaunched } from '@/lib/onboardingStore';

if (Platform.OS === 'web') {
  enableScreens(false);
}

SplashScreen.preventAutoHideAsync();
configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

function RootNavigator(): React.JSX.Element | null {
  const { isDark } = useTheme();
  const { session, isLoading: authLoading } = useAuth();
  const hasLaunched = useHasLaunched();

  const backgroundColor = isDark ? '#0f172a' : '#f8fafc';
  const AppTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: { ...(isDark ? DarkTheme.colors : DefaultTheme.colors), background: backgroundColor },
  };

  useEffect(() => {
    if (authLoading || hasLaunched === null) return;
    SplashScreen.hideAsync();
  }, [authLoading, hasLaunched]);

  if (authLoading || hasLaunched === null) return null;

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
          <Stack.Screen
            name="add-recipient"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
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
          <ExchangeRatesProvider>
            <RootNavigator />
          </ExchangeRatesProvider>
        </AuthProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
