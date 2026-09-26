import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageSlot from './ImageSlot';
import DocumentTypeModal, { DocumentType, DOCUMENT_LABELS, requiresBack } from './DocumentTypeModal';
import CountryPickerModal from './CountryPickerModal';
import { COUNTRIES, CountryCode } from '@/constants/countries';
import { useTheme } from '@/contexts/ThemeContext';

interface KycStep2DocumentsProps {
  documentType: DocumentType | null;
  issuingCountry: CountryCode | null;
  documentNumber: string;
  frontUri: string | null;
  backUri: string | null;
  onChange: (fields: Partial<{
    documentType: DocumentType;
    issuingCountry: CountryCode;
    documentNumber: string;
    frontUri: string;
    backUri: string;
  }>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function KycStep2Documents({
  documentType, issuingCountry, documentNumber, frontUri, backUri, onChange, onBack, onContinue,
}: KycStep2DocumentsProps): React.JSX.Element {
  const { isDark } = useTheme();
  const [docTypePickerOpen, setDocTypePickerOpen] = useState(false);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);

  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark'
    : 'rounded-2xl bg-background-card border border-border-main';

  const needsBack = documentType ? requiresBack(documentType) : false;
  const isValid = documentType !== null && issuingCountry !== null && frontUri !== null && (!needsBack || backUri !== null);

  const pickDocumentImage = async (key: 'frontUri' | 'backUri') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to upload your document.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true });
    if (!result.canceled) onChange({ [key]: result.assets[0].uri });
  };

  return (
    <View>
      <Text className={isDark ? 'text-text-muted-dark text-xs mb-2' : 'text-text-muted text-xs mb-2'}>DOCUMENT TYPE</Text>
      <Pressable onPress={() => setDocTypePickerOpen(true)} className={`${cardClass} p-4 flex-row items-center justify-between`}>
        <Text className={isDark ? 'text-text-main-dark text-sm' : 'text-text-main text-sm'}>
          {documentType ? DOCUMENT_LABELS[documentType] : 'Select document type'}
        </Text>
        <Feather name="chevron-down" size={16} color={isDark ? '#94a3b8' : '#64748b'} />
      </Pressable>

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-2 mt-5' : 'text-text-muted text-xs mb-2 mt-5'}>ISSUING COUNTRY</Text>
      <Pressable onPress={() => setCountryPickerOpen(true)} className={`${cardClass} p-4 flex-row items-center justify-between`}>
        <Text className={isDark ? 'text-text-main-dark text-sm' : 'text-text-main text-sm'}>
          {issuingCountry ? `${COUNTRIES[issuingCountry].flag}  ${COUNTRIES[issuingCountry].name}` : 'Select country'}
        </Text>
        <Feather name="chevron-down" size={16} color={isDark ? '#94a3b8' : '#64748b'} />
      </Pressable>

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-2 mt-5' : 'text-text-muted text-xs mb-2 mt-5'}>DOCUMENT NUMBER (OPTIONAL)</Text>
      <Input placeholder="e.g. A1234567" value={documentNumber} onChangeText={(v) => onChange({ documentNumber: v })} />

      <Text className={isDark ? 'text-text-muted-dark text-xs mb-2 mt-6' : 'text-text-muted text-xs mb-2 mt-6'}>DOCUMENT PHOTOS</Text>
      <View className="flex-row" style={{ gap: 12 }}>
        <View className="flex-1">
          <ImageSlot uri={frontUri} label="Front" onPress={() => pickDocumentImage('frontUri')} />
        </View>
        {needsBack && (
          <View className="flex-1">
            <ImageSlot uri={backUri} label="Back" onPress={() => pickDocumentImage('backUri')} />
          </View>
        )}
      </View>

      <View className="flex-row mt-8 mb-4" style={{ gap: 12 }}>
        <Pressable onPress={onBack} className="px-5 items-center justify-center">
          <Text className={isDark ? 'text-text-muted-dark text-sm' : 'text-text-muted text-sm'}>Back</Text>
        </Pressable>
        <View className="flex-1">
          <Button label="Continue" onPress={onContinue} disabled={!isValid} />
        </View>
      </View>

      <DocumentTypeModal visible={docTypePickerOpen} onSelect={(type) => onChange({ documentType: type })} onClose={() => setDocTypePickerOpen(false)} />
      <CountryPickerModal visible={countryPickerOpen} onSelect={(code) => onChange({ issuingCountry: code })} onClose={() => setCountryPickerOpen(false)} />
    </View>
  );
}
