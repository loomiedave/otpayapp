import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/ui/Button';
import ImageSlot from './ImageSlot';
import { DocumentType, DOCUMENT_LABELS } from './DocumentTypeModal';
import { COUNTRIES, CountryCode } from '@/constants/countries';
import { useTheme } from '@/contexts/ThemeContext';

interface KycStep3SelfieProps {
  documentType: DocumentType;
  issuingCountry: CountryCode;
  documentNumber: string;
  selfieUri: string | null;
  onSelfieCaptured: (uri: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

export default function KycStep3Selfie({
  documentType, issuingCountry, documentNumber, selfieUri, onSelfieCaptured, onBack, onSubmit, submitting,
}: KycStep3SelfieProps): React.JSX.Element {
  const { isDark } = useTheme();
  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark p-4'
    : 'rounded-2xl bg-background-card border border-border-main p-4';

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to verify your identity.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7, cameraType: ImagePicker.CameraType.front });
    if (!result.canceled) onSelfieCaptured(result.assets[0].uri);
  };

  return (
    <View>
      <Text className={isDark ? 'text-text-muted-dark text-xs mb-2' : 'text-text-muted text-xs mb-2'}>SELFIE (LIVE CAMERA ONLY)</Text>
      <ImageSlot uri={selfieUri} label="Take a selfie" onPress={takeSelfie} />

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-2 mt-6' : 'text-text-muted text-xs mb-2 mt-6'}>REVIEW</Text>
      <View className={cardClass}>
        <Text className={isDark ? 'text-text-main-dark text-sm mb-1' : 'text-text-main text-sm mb-1'}>
          {DOCUMENT_LABELS[documentType]} · {COUNTRIES[issuingCountry].flag} {COUNTRIES[issuingCountry].name}
        </Text>
        {documentNumber ? (
          <Text className={isDark ? 'text-text-muted-dark text-xs' : 'text-text-muted text-xs'}>Document #: {documentNumber}</Text>
        ) : null}
      </View>

      <View className="flex-row mt-8 mb-4" style={{ gap: 12 }}>
        <Pressable onPress={onBack} className="px-5 items-center justify-center">
          <Text className={isDark ? 'text-text-muted-dark text-sm' : 'text-text-muted text-sm'}>Back</Text>
        </Pressable>
        <View className="flex-1">
          <Button label={submitting ? 'Submitting…' : 'Submit for Review'} onPress={onSubmit} disabled={!selfieUri || submitting} />
        </View>
      </View>
    </View>
  );
}
