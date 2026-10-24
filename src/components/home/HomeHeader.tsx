import React from 'react';
import CountryFlag from 'react-native-country-flag';
import { View, Text, Pressable } from 'react-native';

import { useTranslation } from 'react-i18next';

import { useTheme } from '@/contexts/ThemeContext';

interface HomeHeaderProps {
  userName: string;
}

export default function HomeHeader({ userName }: HomeHeaderProps): React.JSX.Element {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <View className="flex-row items-center justify-between px-6 pt-4 pb-6">
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3">
          <Text className="text-white font-bold text-lg">{userName.charAt(0)}</Text>
        </View>
        <View>
          <Text className={isDark ? 'text-text-muted-dark text-sm' : 'text-text-muted text-sm'}>
           {t('home.welcome_back')}
          </Text>
          <Text className={isDark ? 'text-text-main-dark font-bold text-xl' : 'text-text-main font-bold text-xl'}>
            {userName}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center">
        <Pressable
          onPress={toggleLanguage}
          className={
            isDark
              ? 'w-11 h-11 rounded-full items-center justify-center mr-2 overflow-hidden'
              : 'w-11 h-11 rounded-full items-center justify-center mr-2 overflow-hidden'
          }
        >
          <CountryFlag isoCode={i18n.language === 'en' ? 'gb' : 'fr'} size={20} />
        </Pressable>
      </View>
    </View>
  );
}
