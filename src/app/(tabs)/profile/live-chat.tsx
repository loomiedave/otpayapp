import React, { useState } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import Input from '../../../components/ui/Input';
import { Pressable } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSupportChat } from '@/hooks/useSupportChat';

export default function LiveChatScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { messages, loading, sendMessage } = useSupportChat();
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  };

  if (loading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Live Chat" />
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer paddingHorizontal={false}>
      <ScreenHeader title="Live Chat" />
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
            Send a message and our team will reply here.
          </Text>
        }
      />
      <View className="flex-row items-center" style={{ gap: 8, paddingHorizontal: 12 }}>
        <View className="flex-1">
          <Input placeholder="Type a message…" value={draft} onChangeText={setDraft} onSubmitEditing={handleSend} />
        </View>
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
