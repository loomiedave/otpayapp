import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import ScreenHeader from '../../../components/ui/ScreenHeader';

export default function SendCheckoutScreen(): React.JSX.Element {
  const { transferId, checkoutUrl } = useLocalSearchParams<{ transferId: string; checkoutUrl: string }>();

  return (
    <ScreenContainer>
      <ScreenHeader title="Complete Payment" />
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
