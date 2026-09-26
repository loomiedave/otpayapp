import { Feather } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Pressable } from 'react-native';
import Animated, {
  AnimatedRef,
  SharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { markLaunched } from '@/lib/onboardingStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonProps = {
  flatListRef: AnimatedRef<FlatList>;
  flatListIndex: SharedValue<number>;
  dataLength: number;
};

export function Button({ dataLength, flatListIndex, flatListRef }: ButtonProps) {
  const { isDark } = useTheme();

  const buttonAnimationStyle = useAnimatedStyle(() => {
    const isLastScreen = flatListIndex.value === dataLength - 1;
    return {
      width: isLastScreen ? withSpring(140) : withSpring(60),
      height: 60,
    };
  });

  const arrowAnimationStyle = useAnimatedStyle(() => {
    const isLastScreen = flatListIndex.value === dataLength - 1;
    return {
      opacity: isLastScreen ? withTiming(0) : withTiming(1),
      transform: [{ translateX: isLastScreen ? withTiming(100) : withTiming(0) }],
    };
  });

  const textAnimationStyle = useAnimatedStyle(() => {
    const isLastScreen = flatListIndex.value === dataLength - 1;
    return {
      opacity: isLastScreen ? withTiming(1) : withTiming(0),
      transform: [{ translateX: isLastScreen ? withTiming(0) : withTiming(-100) }],
    };
  });

  const handleNextScreen = () => {
    const isLastScreen = flatListIndex.value === dataLength - 1;
    if (!isLastScreen) {
      flatListRef.current?.scrollToIndex({ index: flatListIndex.value + 1 });
    } else {
      markLaunched();
    }
  };

  return (
    <AnimatedPressable
      onPress={handleNextScreen}
      className={
        isDark
          ? 'p-2.5 rounded-full items-center justify-center overflow-hidden bg-primary-dark'
          : 'p-2.5 rounded-full items-center justify-center overflow-hidden bg-primary'
      }
      style={buttonAnimationStyle}
    >
      <Animated.Text
        className="absolute text-base font-bold text-white"
        style={textAnimationStyle}
      >
        Get Started
      </Animated.Text>

      <Animated.View className="absolute" style={arrowAnimationStyle}>
        <Feather name="arrow-right" size={30} color="#ffffff" />
      </Animated.View>
    </AnimatedPressable>
  );
}
