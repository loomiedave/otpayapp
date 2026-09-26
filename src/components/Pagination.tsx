import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { type Data } from '../data/screens';

type PaginationCompProps = {
  index: number;
  x: SharedValue<number>;
  screenWidth: number;
  isDark: boolean;
};

const PaginationComp = ({ index, x, screenWidth, isDark }: PaginationCompProps) => {
  const animatedDotStyle = useAnimatedStyle(() => {
    const widthAnimation = interpolate(
      x.value,
      [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth],
      [10, 20, 10],
      Extrapolation.CLAMP
    );
    const opacityAnimation = interpolate(
      x.value,
      [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );
    return { width: widthAnimation, opacity: opacityAnimation };
  });

  return (
    <Animated.View
      className={isDark ? 'h-2.5 rounded-full mx-2.5 bg-primary-dark' : 'h-2.5 rounded-full mx-2.5 bg-primary'}
      style={animatedDotStyle}
    />
  );
};

type PaginationProps = {
  data: Data[];
  x: SharedValue<number>;
  screenWidth: number;
};

export function Pagination({ data, screenWidth, x }: PaginationProps) {
  const { isDark } = useTheme();
  return (
    <View className="h-10 flex-row items-center justify-center">
      {data.map((item, index) => (
        <PaginationComp key={item.id} index={index} x={x} screenWidth={screenWidth} isDark={isDark} />
      ))}
    </View>
  );
}
