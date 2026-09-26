import React, { useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'How long do transfers take?',
    answer: 'Most transfers arrive within minutes. Some destinations or payment methods may take up to 24 hours.',
  },
  {
    id: '2',
    question: 'What are the transfer fees?',
    answer: 'Fees vary by amount and destination and are always shown before you confirm a transfer — no hidden charges.',
  },
  {
    id: '3',
    question: 'Is my money safe?',
    answer: 'Yes. All transfers are encrypted and processed through licensed payment partners in each country.',
  },
  {
    id: '4',
    question: 'How do I cancel a transfer?',
    answer: 'Pending transfers can be cancelled from the transaction details screen. Completed transfers cannot be reversed.',
  },
];

const SUPPORT_EMAIL = 'support@akosap.com';
const SUPPORT_PHONE = '+233000000000';

export default function SupportScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark'
    : 'rounded-2xl bg-background-card border border-border-main';

  const rowBorderClass = isDark ? 'border-b border-border-main-dark' : 'border-b border-border-main';

  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Help & Support" />

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-3' : 'text-text-muted text-xs mb-3'}>
        CONTACT US
      </Text>
      <View className={`${cardClass} px-4 mb-8`}>
        <Pressable
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          className={`flex-row items-center py-4 active:opacity-70 ${rowBorderClass}`}
        >
          <View
            className={
              isDark
                ? 'w-10 h-10 rounded-full bg-background-main-dark items-center justify-center mr-3'
                : 'w-10 h-10 rounded-full bg-background-main items-center justify-center mr-3'
            }
          >
            <Feather name="mail" size={18} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className={isDark ? 'text-text-main-dark font-semibold text-sm' : 'text-text-main font-semibold text-sm'}>
              Email Support
            </Text>
            <Text className={isDark ? 'text-text-muted-dark text-xs mt-0.5' : 'text-text-muted text-xs mt-0.5'}>
              {SUPPORT_EMAIL}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.iconMuted} />
        </Pressable>

        <Pressable
          onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE}`)}
          className="flex-row items-center py-4 active:opacity-70"
        >
          <View
            className={
              isDark
                ? 'w-10 h-10 rounded-full bg-background-main-dark items-center justify-center mr-3'
                : 'w-10 h-10 rounded-full bg-background-main items-center justify-center mr-3'
            }
          >
            <Feather name="phone" size={18} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className={isDark ? 'text-text-main-dark font-semibold text-sm' : 'text-text-main font-semibold text-sm'}>
              Call Support
            </Text>
            <Text className={isDark ? 'text-text-muted-dark text-xs mt-0.5' : 'text-text-muted text-xs mt-0.5'}>
              Mon–Fri, 9am–6pm GMT
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.iconMuted} />
        </Pressable>
      </View>

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-3' : 'text-text-muted text-xs mb-3'}>
        FREQUENTLY ASKED QUESTIONS
      </Text>
      <View className={`${cardClass} px-4`}>
        {FAQ_ITEMS.map((item, index) => {
          const isExpanded = expandedId === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setExpandedId(isExpanded ? null : item.id)}
              className={`py-4 active:opacity-70 ${index !== FAQ_ITEMS.length - 1 ? rowBorderClass : ''}`}
            >
              <View className="flex-row items-center justify-between">
                <Text
                  className={
                    isDark
                      ? 'text-text-main-dark font-semibold text-sm flex-1 pr-3'
                      : 'text-text-main font-semibold text-sm flex-1 pr-3'
                  }
                >
                  {item.question}
                </Text>
                <Feather
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.iconMuted}
                />
              </View>
              {isExpanded && (
                <Text
                  className={
                    isDark
                      ? 'text-text-muted-dark text-sm leading-5 mt-2'
                      : 'text-text-muted text-sm leading-5 mt-2'
                  }
                >
                  {item.answer}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
}
