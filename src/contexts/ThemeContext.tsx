import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import * as SystemUI from 'expo-system-ui';

const THEME_KEY = '@akosap_theme';

type ThemeContextValue = {
  isDark: boolean;
  mode: 'light' | 'dark' | 'system';
  setMode: (mode: 'light' | 'dark' | 'system') => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') setModeState(saved);
    })();
  }, []);

  const setMode = (next: 'light' | 'dark' | 'system') => {
    setModeState(next);
    if (next === 'system') {
      AsyncStorage.removeItem(THEME_KEY);
    } else {
      AsyncStorage.setItem(THEME_KEY, next);
    }
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  // Keep the native root view background (what shows through during
  // screen transitions and gestures, outside the React tree) in sync
  // with the theme. This is what fixes the white flash between screens.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(isDark ? '#0f172a' : '#f8fafc');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
