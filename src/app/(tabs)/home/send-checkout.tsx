import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';

import { useTranslation } from 'react-i18next';

import ScreenHeader from '@/components/ui/ScreenHeader';
import ScreenContainer from '@/components/ui/ScreenContainer';

export default function SendCheckoutScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { transferId, checkoutUrl } = useLocalSearchParams<{ transferId: string; checkoutUrl: string }>();

  return (
    <ScreenContainer>
      <ScreenHeader title={t('send.checkout_title')} />
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: checkoutUrl }}
          onNavigationStateChange={(nav) => {
            if (nav.url.includes('/receipt/')) {
              router.replace({ pathname: '/home/send-waiting', params: { transferId } });
            }
          }}
        />
      </View>
    </ScreenContainer>
  );
}
