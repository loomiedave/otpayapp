import {
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewToken,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Pagination } from '@/components/Pagination';
import { data, type Data } from '@/data/screens';
import { useTheme } from '@/contexts/ThemeContext';

const RenderItem = ({ item, index, x }: { item: Data; index: number; x: SharedValue<number> }) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { isDark } = useTheme();

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const opacityAnimation = interpolate(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateYAnimation = interpolate(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [100, 0, 100],
      Extrapolation.CLAMP
    );
    return {
      width: SCREEN_WIDTH * 0.8,
      height: SCREEN_WIDTH * 0.8,
      opacity: opacityAnimation,
      transform: [{ translateY: translateYAnimation }],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const opacityAnimation = interpolate(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateYAnimation = interpolate(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [100, 0, 100],
      Extrapolation.CLAMP
    );
    return {
      opacity: opacityAnimation,
      transform: [{ translateY: translateYAnimation }],
    };
  });

  return (
    <View
      style={{ width: SCREEN_WIDTH, flex: 1, alignItems: 'center', justifyContent: 'space-around' }}
      className={isDark ? 'bg-background-main-dark' : 'bg-background-main'}
    >
      <Animated.Image source={item.image} style={imageAnimatedStyle} />
      <Animated.View style={textAnimatedStyle}>
        <Text className={isDark ? 'text-2xl font-bold text-center mb-2.5 text-text-main-dark' : 'text-2xl font-bold text-center mb-2.5 text-text-main'}>
          {item.title}
        </Text>
        <Text className={isDark ? 'text-center leading-5 mx-7 text-text-muted-dark' : 'text-center leading-5 mx-7 text-text-muted'}>
          {item.text}
        </Text>
      </Animated.View>
    </View>
  );
};

export default function Onboarding() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { isDark } = useTheme();
  const flatListRef = useAnimatedRef<FlatList>();
  const flatListIndex = useSharedValue(0);
  const x = useSharedValue(0);

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: Array<ViewToken>;
  }) => {
    flatListIndex.value = viewableItems[0].index ?? 0;
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });

  return (
    <View
      style={styles.container}
      className={isDark ? 'bg-background-main-dark' : 'bg-background-main'}
    >
      <Animated.FlatList
        ref={flatListRef as any}
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <RenderItem index={index} item={item} x={x} />
        )}
        onScroll={onScroll}
        scrollEventThrottle={16}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        pagingEnabled
        onViewableItemsChanged={onViewableItemsChanged}
      />
      <View style={styles.footerContainer}>
        <Pagination data={data} screenWidth={SCREEN_WIDTH} x={x} />
        <Button
          flatListRef={flatListRef}
          flatListIndex={flatListIndex}
          dataLength={data.length}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 20,
  },
});
