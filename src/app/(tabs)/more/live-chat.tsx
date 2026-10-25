import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { View, Text, FlatList } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

import { useSupportChat } from '@/hooks/useSupportChat';

import Input from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import ScreenHeader from '@/components/ui/ScreenHeader';
import ScreenContainer from '@/components/ui/ScreenContainer';
import { useTranslation } from 'react-i18next';

export default function LiveChatScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const { messages, loading, sendMessage } = useSupportChat();
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  };

  if (loading) {
    return (
     <Loading />
    );
  }

  return (
    <ScreenContainer paddingHorizontal={false}>
      <ScreenHeader title={t('support.live_chat')} />
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 12 }}
        renderItem={({ item }) => {
          const isMine = item.sender === 'user';

          let bubbleClass: string;
          let textClass: string;

          if (isMine) {
            bubbleClass = isDark
              ? 'bg-primary-dark rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]'
              : 'bg-primary rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]';
            textClass = 'text-white text-sm';
          } else {
            bubbleClass = isDark
              ? 'bg-background-card-dark border border-border-main-dark rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%]'
              : 'bg-background-card border border-border-main rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[80%]';
            textClass = isDark ? 'text-text-main-dark text-sm' : 'text-text-main text-sm';
          }

          return (
            <View style={{ alignItems: isMine ? 'flex-end' : 'flex-start' }}>
              <View className={bubbleClass}>
                <Text className={textClass}>{item.body}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text className={isDark ? 'text-text-muted-dark text-sm text-center mt-10' : 'text-text-muted text-sm text-center mt-10'}>
            {t('support.empty_chat')}
          </Text>
        }
      />
      <View className="flex-row items-center" style={{ gap: 8, paddingHorizontal: 12 }}>
        <View className="flex-1">
        <Input placeholder={t('support.type_a_message')} value={draft} onChangeText={setDraft} onSubmitEditing={handleSend} /></View>
        <Pressable
          onPress={handleSend}
          className="w-11 h-11 rounded-full items-center justify-center"
          style={{ backgroundColor: '#D4A62B' }}
        >
          <Feather name="send" size={16} color="#12151C" />
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
