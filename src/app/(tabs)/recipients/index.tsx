import { Feather } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { supabase } from '@/lib/supabase';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

import { useThemeColors } from '@/hooks/useThemeColors';

import { COUNTRIES, CountryCode } from '@/constants/countries';

import ScreenHeader from '@/components/ui/ScreenHeader';
import ScreenContainer from '@/components/ui/ScreenContainer';

interface Recipient {
  id: string;
  full_name: string;
  country: CountryCode;
  phone: string;
}

export default function RecipientsScreen(): React.JSX.Element {
  const { session } = useAuth();
  const { isDark } = useTheme();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const userId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        setLoading(false);
        return;
      }

      let active = true;

      (async () => {
        const { data, error: fetchError } = await supabase
          .from('recipients')
          .select('id, full_name, country, phone')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false }); // remove if no created_at column

        if (!active) return;

        if (fetchError) {
          setError(t('recipients.load_error'));
        } else {
          setError(null);
          setRecipients((data ?? []) as Recipient[]);
        }

        setLoading(false);
      })();

      return () => {
        active = false;
      };
    }, [userId, t])
  );

  const handleDelete = async (r: Recipient): Promise<void> => {
    if (!userId) return;

    const prev = recipients;
    setRecipients((list) => list.filter((x) => x.id !== r.id));

    const { data, error: delError } = await supabase
      .from('recipients')
      .delete()
      .eq('id', r.id)
      .eq('owner_id', userId)
      .select('id');

    // RLS with no delete policy returns no error but deletes 0 rows
    if (delError || !data || data.length === 0) {
      setRecipients(prev);
      Alert.alert(
        t('recipients.error'),
        t('recipients.delete_error')
      );
    }
  };

  const confirmDelete = (r: Recipient): void => {
    Alert.alert(
      t('recipients.delete'),
      t('recipients.confirm_delete', { name: r.full_name }),
      [
        { text: t('recipients.cancel'), style: 'cancel' },
        {
          text: t('recipients.delete_action'),
          style: 'destructive',
          onPress: () => handleDelete(r),
        },
      ]
    );
  };

  return (
    <ScreenContainer scroll>
      <ScreenHeader title={t('recipients.title')} showBackButton={false} />

      <Pressable
        onPress={() => router.push('/(tabs)/recipients/add-recipient')}
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

        <Text
          className={
            isDark
              ? 'text-text-main-dark font-semibold'
              : 'text-text-main font-semibold'
          }
        >
          {t('recipients.add_new')}
        </Text>
      </Pressable>

      {loading ? (
        <View className="py-16 items-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <Text className="text-center py-16" style={{ color: '#ef4444' }}>
          {error}
        </Text>
      ) : recipients.length === 0 ? (
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
              isDark
                ? 'text-text-main-dark font-bold text-base mb-1'
                : 'text-text-main font-bold text-base mb-1'
            }
          >
            {t('recipients.empty_title')}
          </Text>

          <Text
            className={
              isDark
                ? 'text-text-muted-dark text-sm text-center px-8'
                : 'text-text-muted text-sm text-center px-8'
            }
          >
            {t('recipients.empty_description')}
          </Text>
        </View>
      ) : (
        recipients.map((r, index) => (
          <Pressable
            key={r.id}
            onPress={() => router.push('/home/send')}
            className={`flex-row items-center py-4 active:opacity-70 ${
              index !== recipients.length - 1
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
              <Text className="text-lg">
                {COUNTRIES[r.country]?.flag ?? '🌍'}
              </Text>
            </View>

            <View className="flex-1">
              <Text
                className={
                  isDark
                    ? 'text-text-main-dark font-bold text-base'
                    : 'text-text-main font-bold text-base'
                }
              >
                {r.full_name}
              </Text>

              <Text
                className={
                  isDark
                    ? 'text-text-muted-dark text-sm mt-0.5'
                    : 'text-text-muted text-sm mt-0.5'
                }
              >
                {`${r.phone} · ${COUNTRIES[r.country]?.name ?? r.country}`}
              </Text>
            </View>

            <Pressable
              onPress={() => confirmDelete(r)}
              hitSlop={10}
              className="p-2 mr-1"
            >
              <Feather name="trash-2" size={18} color="#ef4444" />
            </Pressable>

            <Feather name="chevron-right" size={18} color={colors.iconMuted} />
          </Pressable>
        ))
      )}
    </ScreenContainer>
  );
}