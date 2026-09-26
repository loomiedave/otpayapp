import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COUNTRIES, CountryCode } from '../../constants/countries';
import { formatRate } from '../../lib/currency';
import { DirectionalRate } from '../../hooks/useExchangeRates';
import { useTheme } from '../../contexts/ThemeContext';

interface RateTickerProps {
  rates: DirectionalRate[];
  onSelect: (from: CountryCode, to: CountryCode) => void;
}

export default function RateTicker({ rates, onSelect }: RateTickerProps): React.JSX.Element {
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const sortedRates = [...rates].sort((a, b) => {
    // Active corridors always come before inactive ones
    if (a.is_active !== b.is_active) {
      return a.is_active ? -1 : 1;
    }
    // Within the same active/inactive group, sort alphabetically as before
    const nameCompare = COUNTRIES[a.from].name.localeCompare(COUNTRIES[b.from].name);
    if (nameCompare !== 0) return nameCompare;
    return COUNTRIES[a.to].name.localeCompare(COUNTRIES[b.to].name);
  });

  const openModal = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 90 }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 0.9, duration: 150, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  };

  const handleSelect = (from: CountryCode, to: CountryCode, active: boolean) => {
    if (!active) return;
    onSelect(from, to);
    closeModal();
  };

  return (
    <>
      <Pressable
        onPress={openModal}
        className={
          isDark
            ? 'mx-6 flex-row items-center justify-between px-4 py-3.5 rounded-2xl bg-background-card-dark border border-border-main-dark active:opacity-70'
            : 'mx-6 flex-row items-center justify-between px-4 py-3.5 rounded-2xl bg-background-card border border-border-main active:opacity-70'
        }
      >
        <View className="flex-row items-center">
          <View className="w-1.5 h-1.5 rounded-full mr-2 bg-accent" />
          <Text className={isDark ? 'text-text-main-dark text-sm font-bold' : 'text-text-main text-sm font-bold'}>
            View other rates
          </Text>
        </View>
        <Feather name="align-justify" size={16} color={isDark ? '#8A93A6' : '#6B7280'} />
      </Pressable>

      <Modal visible={visible} transparent animationType="none" onRequestClose={closeModal}>
        <Animated.View
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', opacity: backdropOpacity }}
        >
          <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={closeModal} />

          <Animated.View
            style={{
              width: '86%',
              maxHeight: '75%',
              borderRadius: 24,
              overflow: 'hidden',
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            }}
            className={isDark ? 'bg-background-card-dark border border-border-main-dark' : 'bg-background-card border border-border-main'}
          >
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
              <Text className={isDark ? 'text-text-main-dark text-base font-bold' : 'text-text-main text-base font-bold'}>
                Exchange rates
              </Text>
              <Pressable onPress={closeModal} hitSlop={10}>
                <Feather name="x" size={20} color={isDark ? '#8A93A6' : '#6B7280'} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 12 }}>
              {sortedRates.map((r, i) => (
                <Pressable
                  key={`${r.from}-${r.to}`}
                  onPress={() => handleSelect(r.from, r.to, r.is_active)}
                  disabled={!r.is_active}
                  className={
                    isDark
                      ? 'flex-row items-center justify-between px-4 py-4 active:bg-white/5 rounded-xl'
                      : 'flex-row items-center justify-between px-4 py-4 active:bg-black/5 rounded-xl'
                  }
                  style={[
                    i !== sortedRates.length - 1
                      ? { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }
                      : undefined,
                    !r.is_active ? { opacity: 0.4 } : undefined,
                  ]}
                >
                  <View className="flex-row items-center">
                    <Text className="text-sm mr-2">{COUNTRIES[r.from].flag}{COUNTRIES[r.to].flag}</Text>
                    <Text className={isDark ? 'text-text-main-dark text-sm font-medium' : 'text-text-main text-sm font-medium'}>
                      {COUNTRIES[r.from].name} → {COUNTRIES[r.to].name}
                    </Text>
                  </View>
                  <View className="items-end">
                    {r.is_active ? (
                      <>
                        <Text
                          className={isDark ? 'text-text-main-dark text-base font-extrabold' : 'text-text-main text-base font-extrabold'}
                          style={{ fontVariant: ['tabular-nums'] }}
                        >
                          {formatRate(r.rate)}
                        </Text>
                        <Text className={isDark ? 'text-text-muted-dark text-xs' : 'text-text-muted text-xs'}>
                          {r.fee > 0 ? `+${r.fee} fee` : '0 fees'}
                        </Text>
                      </>
                    ) : (
                      <Text className={isDark ? 'text-text-muted-dark text-xs' : 'text-text-muted text-xs'}>
                        Coming soon
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}
