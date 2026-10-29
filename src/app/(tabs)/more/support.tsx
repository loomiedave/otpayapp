import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View, Text, Pressable, Linking } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

import { useFaqs } from '@/hooks/useFaqs';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSupportContacts, SupportContactRow } from '@/hooks/useSupportContacts';

import ScreenHeader from '@/components/ui/ScreenHeader';
import ScreenContainer from '@/components/ui/ScreenContainer';

export default function SupportScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const faqs = useFaqs();
  const contacts = useSupportContacts();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isFr = i18n.language?.startsWith('fr') ?? false;

  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark'
    : 'rounded-2xl bg-background-card border border-border-main';

  const rowBorderClass = isDark ? 'border-b border-border-main-dark' : 'border-b border-border-main';
  const sectionLabelClass = isDark ? 'text-text-muted-dark text-xs mb-3' : 'text-text-muted text-xs mb-3';

  const openContact = (c: SupportContactRow): void => {
    const url = c.type === 'email' ? `mailto:${c.value}` : `tel:${c.value}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScreenContainer scroll>
      <ScreenHeader title={t('support.title')} />

      {contacts.length > 0 && (
        <>
          <Text className={sectionLabelClass}>{t('support.contact_us')}</Text>
          <View className={`${cardClass} px-4 mb-8`}>
            {contacts.map((c, index) => (
              <Pressable
                key={c.id}
                onPress={() => openContact(c)}
                className={`flex-row items-center py-4 active:opacity-70 ${
                  index !== contacts.length - 1 ? rowBorderClass : ''
                }`}
              >
                <View
                  className={
                    isDark
                      ? 'w-10 h-10 rounded-full bg-background-main-dark items-center justify-center mr-3'
                      : 'w-10 h-10 rounded-full bg-background-main items-center justify-center mr-3'
                  }
                >
                  <Feather name={c.type === 'email' ? 'mail' : 'phone'} size={18} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className={isDark ? 'text-text-main-dark font-semibold text-sm' : 'text-text-main font-semibold text-sm'}>
                    {(isFr && c.label_fr) || c.label_en}
                  </Text>
                  <Text className={isDark ? 'text-text-muted-dark text-xs mt-0.5' : 'text-text-muted text-xs mt-0.5'}>
                    {c.value}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.iconMuted} />
              </Pressable>
            ))}
          </View>
        </>
      )}

      {faqs.length > 0 && (
        <>
          <Text className={sectionLabelClass}>{t('support.faq')}</Text>
          <View className={`${cardClass} px-4`}>
            {faqs.map((item, index) => {
              const isExpanded = expandedId === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  className={`py-4 active:opacity-70 ${index !== faqs.length - 1 ? rowBorderClass : ''}`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={
                        isDark
                          ? 'text-text-main-dark font-semibold text-sm flex-1 pr-3'
                          : 'text-text-main font-semibold text-sm flex-1 pr-3'
                      }
                    >
                      {(isFr && item.question_fr) || item.question_en}
                    </Text>
                    <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.iconMuted} />
                  </View>
                  {isExpanded && (
                    <Text
                      className={
                        isDark
                          ? 'text-text-muted-dark text-sm leading-5 mt-2'
                          : 'text-text-muted text-sm leading-5 mt-2'
                      }
                    >
                      {(isFr && item.answer_fr) || item.answer_en}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </ScreenContainer>
  );
}
