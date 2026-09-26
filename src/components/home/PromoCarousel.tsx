// components/home/PromoCarousel.tsx
import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router'

export interface PromoCard {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  colors: [string, string];
  route?: string
}

// Placeholder copy — swap for real campaigns when you have them.
// Written to sound like actual promos this app would run, not filler text.
const DEFAULT_PROMOS: PromoCard[] = [
  {
    id: 'kyc',
    title: 'Verify your OTPAY account by submitting your details',
    subtitle: 'Choose fromour list of acceptable documents to submit',
    icon: 'upload',
    colors: ['#1B2130', '#2B3245'],
    route: '/(tabs)/profile'
  },
  {
    id: 'live-chat',
    title: 'Chat with our support instantly',
    subtitle: 'We have available personel ready to chat during work from 7am-8pm Monday-Saturday',
    icon: 'message-circle',
    colors: ['#1B2130', '#2B3245'],
    route: '/(tabs)/profile'
  },
  {
    id: 'referral',
    title: 'Invite a friends and earn bonuses',
    subtitle: 'They get their first transfer fee-free too',
    icon: 'users',
    colors: ['#12151C', '#1F2A1C'],
  },
  {
    id: 'live-rates',
    title: 'Rates update live, all day',
    subtitle: 'No delay to updates on every corridor, every minute',
    icon: 'trending-up',
    colors: ['#12151C', '#1B2130'],
  },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48; // matches 24px page padding on both sides
const AMBER = '#E8A93B';

interface PromoCarouselProps {
  promos?: PromoCard[];
  onPressCard?: (promo: PromoCard) => void;
}

export default function PromoCarousel({ promos = DEFAULT_PROMOS, onPressCard }: PromoCarouselProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
    setActiveIndex(index);
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
      >
        {promos.map((promo) => (
          <Pressable
            key={promo.id}
           // onPress={() => onPressCard?.(promo)}
            onPress={() => router.push(promo.route as never)}
            style={{ width: CARD_WIDTH }}
            className="active:opacity-90"
          >
            <LinearGradient
              colors={promo.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center' }}
            >
              <View
                className="w-11 h-11 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: 'rgba(232,169,59,0.15)' }}
              >
                <Feather name={promo.icon} size={18} color={AMBER} />
              </View>
              <View className="flex-1">
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{promo.title}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>
                  {promo.subtitle}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.4)" />
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>

      {/* paging dots */}
      <View className="flex-row justify-center mt-3" style={{ gap: 5 }}>
        {promos.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === activeIndex ? 16 : 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: i === activeIndex ? AMBER : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </View>
    </View>
  );
}
