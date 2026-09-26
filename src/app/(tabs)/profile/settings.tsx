import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';

export default function SettingsScreen(): React.JSX.Element {
  const { isDark, mode, setMode } = useTheme();
  return (
    <ScrollView className={isDark ? 'flex-1 bg-background-main-dark' : 'flex-1 bg-background-main'}>
      <View className="pt-16 px-6">
        <Text
          className={
            isDark
              ? 'text-2xl font-bold text-text-main-dark mb-6'
              : 'text-2xl font-bold text-text-main mb-6'
          }
        >
          Appearance
        </Text>
        {(['light', 'dark', 'system'] as const).map((option) => (
          <Pressable
            key={option}
            className={
              isDark
                ? 'py-4 border-b border-border-main-dark'
                : 'py-4 border-b border-border-main'
            }
            onPress={() => setMode(option)}
          >
            <Text
              className={
                isDark
                  ? 'text-text-main-dark text-base capitalize'
                  : 'text-text-main text-base capitalize'
              }
            >
              {option} {mode === option ? '✓' : ''}
            </Text>
          </Pressable>
        ))}

        <Text
          className={
            isDark
              ? 'text-2xl font-bold text-text-main-dark mb-6 mt-10'
              : 'text-2xl font-bold text-text-main mb-6 mt-10'
          }
        >
          More
        </Text>
        <Pressable
          className={
            isDark
              ? 'py-4 border-b border-border-main-dark'
              : 'py-4 border-b border-border-main'
          }
          onPress={() => router.push('/profile/support')}
        >
          <Text className={isDark ? 'text-text-main-dark text-base' : 'text-text-main text-base'}>
            Help & Support
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
