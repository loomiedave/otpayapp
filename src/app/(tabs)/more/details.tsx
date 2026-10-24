import { decode } from 'base64-arraybuffer';
import { View, Text, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system/legacy';

import { supabase } from '@/lib/supabase';

import { useTranslation } from 'react-i18next';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

import { CountryCode } from '@/constants/countries';

import ScreenHeader from '@/components/ui/ScreenHeader';
import ProfileField from '@/components/profile/ProfileField';
import KycStep3Selfie from '@/components/kyc/KycStep3Selfie';
import ScreenContainer from '@/components/ui/ScreenContainer';
import KycStatusBanner from '@/components/kyc/KycStatusBanner';
import KycStepIndicator from '@/components/kyc/KycStepIndicator';
import KycStep2Documents from '@/components/kyc/KycStep2Documents';
import DateOfBirthField from '@/components/profile/DateOfBirthField';
import KycStep1Instructions from '@/components/kyc/KycStep1Instructions';
import { DocumentType, requiresBack } from '@/components/kyc/DocumentTypeModal';

interface Profile {
  full_name: string | null;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
}

interface KycSubmission {
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
}

export default function DetailsScreen(): React.JSX.Element {
  const { session } = useAuth();
  const { isDark } = useTheme();
  const { t } = useTranslation();

  const userId = session?.user?.id;
  
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [documentNumber, setDocumentNumber] = useState('');
  const [kyc, setKyc] = useState<KycSubmission | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [issuingCountry, setIssuingCountry] = useState<CountryCode | null>(null);

  const cardClass = isDark
    ? 'rounded-2xl bg-background-card-dark border border-border-main-dark px-4'
    : 'rounded-2xl bg-background-card border border-border-main px-4';
  const sectionLabel = isDark ? 'text-text-muted-dark text-xs mb-2' : 'text-text-muted text-xs mb-2';
  const footnote = isDark ? 'text-text-muted-dark text-xs mt-2' : 'text-text-muted text-xs mt-2';

  const loadData = useCallback(async () => {
    if (!userId) return;
    const [{ data: profileData }, { data: kycData }] = await Promise.all([
      supabase.from('profiles').select('full_name, phone, email, date_of_birth').eq('id', userId).single(),
      supabase.from('kyc_submissions').select('status, rejection_reason').eq('user_id', userId).single(),
    ]);
    setProfile(profileData ?? null);
    setKyc(kycData ?? null);
    setLoading(false);
  }, [userId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const saveProfileField = async (field: 'full_name' | 'phone' | 'date_of_birth', value: string) => {
    if (!userId) return;
    const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', userId);
    if (error) {
      Alert.alert(t('common.error_title'), t('profile.save_error_message'));
      return;
    }
    setProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const uploadFile = async (uri: string, path: string): Promise<string> => {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const { error } = await supabase.storage.from('kyc-documents').upload(path, decode(base64), {
      upsert: true,
      contentType: 'image/jpeg',
    });
    if (error) throw error;
    return path;
  };

  const handleKycSubmit = async () => {
    if (!userId || !documentType || !issuingCountry || !frontUri || !selfieUri) return;
    const needsBack = requiresBack(documentType);
    if (needsBack && !backUri) return;

    setSubmitting(true);
    try {
      const frontPath = await uploadFile(frontUri, `${userId}/front.jpg`);
      const backPath = needsBack ? await uploadFile(backUri!, `${userId}/back.jpg`) : null;
      const selfiePath = await uploadFile(selfieUri, `${userId}/selfie.jpg`);

      const { error } = await supabase.from('kyc_submissions').upsert(
        {
          user_id: userId,
          document_type: documentType,
          issuing_country: issuingCountry,
          document_number: documentNumber.trim() || null,
          front_image_path: frontPath,
          back_image_path: backPath,
          selfie_path: selfiePath,
          status: 'pending',
          rejection_reason: null,
        },
        { onConflict: 'user_id' }
      );
      if (error) throw error;

      setKyc({ status: 'pending', rejection_reason: null });
      Alert.alert(t('profile.kyc_submitted_title'), t('profile.kyc_submitted_message'));
    } catch (err) {
      Alert.alert(t('common.error_title'), t('common.error_try_again'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !profile) {
    return <ScreenContainer><ScreenHeader title={t('profile.personal_details')} /></ScreenContainer>; }

  const showWizard = !kyc || kyc.status === 'rejected';

  return (
    <ScreenContainer scroll keyboardAvoiding>
      <ScreenHeader title={t('profile.personal_details')} />

      <Text className={sectionLabel}>{t('profile.personal_information').toUpperCase()}</Text>
      <View className={cardClass}>
        <ProfileField label={t('profile.full_name')} value={profile.full_name} locked={!!profile.full_name} placeholder={t('profile.full_name_placeholder')} onSave={(v) => saveProfileField('full_name', v)} />
        <DateOfBirthField value={profile.date_of_birth} locked={!!profile.date_of_birth} onSave={(v) => saveProfileField('date_of_birth', v)} />
        <ProfileField label={t('profile.phone')} value={profile.phone} locked={!!profile.phone} keyboardType="phone-pad" placeholder={t('profile.phone_placeholder')} onSave={(v) => saveProfileField('phone', v)} />
        <ProfileField label={t('profile.email')} value={profile.email} locked bordered={false} onSave={() => {}} />
      </View>

      <Text className={footnote}>
        {t('profile.update_details_prefix')}{' '}
        <Text
          className="text-blue-500 underline"
          onPress={() => router.push('/more/live-chat')}
          accessibilityRole="link"
        >
          {t('support.live_chat')}.
        </Text>
      </Text>

      <Text className={`${sectionLabel} mt-6`}>{t('verification.identity_verification').toUpperCase()}</Text>

      {kyc ? <KycStatusBanner status={kyc.status} rejectionReason={kyc.rejection_reason} /> : null}

      {showWizard && (
        <View className={`${cardClass} py-4 ${kyc ? 'mt-3' : ''}`}>
          <KycStepIndicator step={step} />

          {step === 1 && <KycStep1Instructions fullName={profile.full_name ?? ''} onContinue={() => setStep(2)} />}

          {step === 2 && (
            <KycStep2Documents
              documentType={documentType}
              issuingCountry={issuingCountry}
              documentNumber={documentNumber}
              frontUri={frontUri}
              backUri={backUri}
              onChange={(fields) => {
                if (fields.documentType !== undefined) setDocumentType(fields.documentType);
                if (fields.issuingCountry !== undefined) setIssuingCountry(fields.issuingCountry);
                if (fields.documentNumber !== undefined) setDocumentNumber(fields.documentNumber);
                if (fields.frontUri !== undefined) setFrontUri(fields.frontUri);
                if (fields.backUri !== undefined) setBackUri(fields.backUri);
              }}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          )}

          {step === 3 && documentType && issuingCountry && (
            <KycStep3Selfie
              documentType={documentType}
              issuingCountry={issuingCountry}
              documentNumber={documentNumber}
              selfieUri={selfieUri}
              onSelfieCaptured={setSelfieUri}
              onBack={() => setStep(2)}
              onSubmit={handleKycSubmit}
              submitting={submitting}
            />
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
