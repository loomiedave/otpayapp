// components/ui/ScreenContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, ViewStyle, Keyboard } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  keyboardAvoiding?: boolean;
  refreshControl?: React.ReactElement; // add this
  paddingHorizontal?: boolean;
  extraBottomPadding?: number;
  style?: ViewStyle;
}

export default function ScreenContainer({
  children,
  scroll = false,
  edges = ['top', 'bottom'],
  keyboardAvoiding = false,
  paddingHorizontal = true,
  extraBottomPadding = 0,
  style,
}: ScreenContainerProps): React.JSX.Element {
  const { isDark } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android' || !keyboardAvoiding) return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardAvoiding]);

  const bottomPadding = Math.max(keyboardHeight, extraBottomPadding);

  const content = scroll ? (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: bottomPadding }}
      bounces={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      className={paddingHorizontal ? 'px-6' : ''}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      className={`flex-1 ${paddingHorizontal ? 'px-6' : ''}`}
      style={{ paddingBottom: bottomPadding }}
    >
      {children}
    </View>
  );

  const body =
    keyboardAvoiding && Platform.OS === 'ios' ? (
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        {content}
      </KeyboardAvoidingView>
    ) : (
      content
    );

  return (
    <SafeAreaView
      edges={edges}
      className={isDark ? 'flex-1 bg-background-main-dark' : 'flex-1 bg-background-main'}
    >
      {body}
    </SafeAreaView>
  );
}
