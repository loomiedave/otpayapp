import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import {
  View, Text, ScrollView, Pressable, Image, Linking, Dimensions,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';

import { usePromos, PromoRow } from '@/hooks/usePromos';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;
const AMBER = '#E8A93B';

function PromoItem({ promo, isFr }: { promo: PromoRow; isFr: boolean }): React.JSX.Element {
  const [imgFailed, setImgFailed] = useState(false);

  const title = (isFr && promo.title_fr) || promo.title_en;
  const subtitle = (isFr && promo.subtitle_fr) || promo.subtitle_en;
  const icon = (promo.icon && promo.icon in Feather.glyphMap ? promo.icon : 'info') as keyof typeof Feather.glyphMap;
  const showImage = !!promo.image_url && !imgFailed;

  const handlePress = (): void => {
    if (!promo.link) return;
    try {
      if (/^https?:\/\//.test(promo.link)) Linking.openURL(promo.link).catch(() => {});
      else router.push(promo.link as never);
    } catch {}
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!promo.link}
      style={{ width: CARD_WIDTH }}
      className="active:opacity-90"
    >
      <LinearGradient
        colors={['#1B2130', '#2B3245']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center' }}
      >
        {showImage ? (
          <Image
            source={{ uri: promo.image_url! }}
            onError={() => setImgFailed(true)}
            className="w-11 h-11 rounded-xl mr-3"
            resizeMode="cover"
          />
        ) : (
          <View
            className="w-11 h-11 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(232,169,59,0.15)' }}
          >
            <Feather name={icon} size={18} color={AMBER} />
          </View>
        )}
        <View className="flex-1">
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{title}</Text>
          {!!subtitle && (
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
          )}
        </View>
        {!!promo.link && <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.4)" />}
      </LinearGradient>
    </Pressable>
  );
}

export default function PromoCarousel(): React.JSX.Element | null {
  const promos = usePromos();
  const { i18n } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const isFr = i18n.language?.startsWith('fr') ?? false;

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12)));
  };

  if (promos.length === 0) return null;

  return (
    <View>
      <ScrollView
        horizontal
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
      >
        {promos.map((p) => (
          <PromoItem key={p.id} promo={p} isFr={isFr} />
        ))}
      </ScrollView>

      <View className="flex-row justify-center mt-3" style={{ gap: 5 }}>
        {promos.map((p, i) => (
          <View
            key={p.id}
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
