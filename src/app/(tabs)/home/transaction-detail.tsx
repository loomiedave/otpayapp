import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import CountryFlag from 'react-native-country-flag';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';

import { useTranslation } from 'react-i18next';

import { supabase } from '@/lib/supabase';
import { formatRate } from '@/lib/currency';

import { useCountries } from '@/hooks/useCountries';

import { Transfer, TransferStatus } from '@/types/transactions';

const NAVY = '#0E2F6B';
const INK = '#0B2A66';
const LABEL = '#5B93D3';
const HAIRLINE = '#E4E9F2';
const GOLD = '#D4A62B';
const SCALLOP = 14;

const STATUS_META: Record<TransferStatus, { label: string; color: string }> = {
  pending_verification: { label: 'transactionDetail.statusPendingVerification', color: '#B45309' },
  confirmed: { label: 'transactionDetail.statusConfirmed', color: '#B45309' },
  paid_out: { label: 'transactionDetail.statusPaidOut', color: '#15803D' },
  failed: { label: 'transactionDetail.statusFailed', color: '#B91C1C' },
};

const NETWORK_LABELS: Record<string, string> = { mtn: 'MTN MoMo', flooz: 'Flooz', tmoney: 'T-Money' };

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

function formatStamp(iso: string, locale: string, t: (key: string, options?: any) => string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return t('transactionDetail.dateAt', { date, time });
}

function Scallops({ edge }: { edge: 'top' | 'bottom' }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        [edge]: -SCALLOP / 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      {Array.from({ length: 22 }).map((_, i) => (
        <View key={i} style={{ width: SCALLOP, height: SCALLOP, borderRadius: SCALLOP / 2, backgroundColor: NAVY }} />
      ))}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: LABEL, fontSize: 13.5, fontWeight: '500', marginBottom: 4 }}>{label}</Text>
      {children}
    </View>
  );
}

function Value({ children, color, size = 19 }: { children: React.ReactNode; color?: string; size?: number }) {
  return <Text style={{ color: color ?? INK, fontSize: size, fontWeight: '600' }}>{children}</Text>;
}

function ActionPill({
  icon, label, onPress, loading, disabled,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        flex: 1,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed || disabled ? 0.7 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator size="small" color={INK} />
      ) : (
        <>
          <Feather name={icon} size={18} color={INK} style={{ marginRight: 10 }} />
          <Text style={{ color: INK, fontSize: 16, fontWeight: '600' }}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export default function TransactionDetailScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { getCountry } = useCountries();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'share' | 'download' | null>(null);
  const shotRef = useRef<any>(null);

  useEffect(() => {
    if (!id) return;
     supabase.from('transfers').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setTransfer(data as Transfer);
      setLoading(false);
    });
  }, [id]);

  const capture = async (): Promise<string | null> => {
    if (!shotRef.current?.capture) return null;
    return shotRef.current.capture();
  };

  const handleShare = async (): Promise<void> => {
    setBusy('share');
    try {
      const uri = await capture();
      if (!uri) return;
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: t('transactionDetail.shareDialogTitle') });
      } else {
        Alert.alert(t('transactionDetail.sharingUnavailableTitle'), t('transactionDetail.sharingUnavailableMessage'));
      }
    } catch {
      Alert.alert(t('transactionDetail.couldNotShareTitle'), t('transactionDetail.retryMessage'));
    } finally {
      setBusy(null);
    }
  };
  
  const handleDownload = async (): Promise<void> => {
    setBusy('download');
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        Alert.alert(t('transactionDetail.permissionTitle'), t('transactionDetail.permissionMessage'));
        return;
      }
      const uri = await capture();
      if (!uri) return;
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert(t('transactionDetail.savedTitle'), t('transactionDetail.savedMessage'));
    } catch {
      Alert.alert(t('transactionDetail.couldNotSaveTitle'), t('transactionDetail.retryMessage'));
    } finally {
      setBusy(null);
    }
  };

  if (loading || !transfer) {
    return (
      <View style={{ flex: 1, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="light" />
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
              <Text style={{ color: '#fff', marginBottom: 16 }}>{t('transactionDetail.notFound')}</Text>            <Pressable onPress={() => router.back()}>
              <Text style={{ color: GOLD, fontWeight: '700' }}>{t('transactionDetail.goBack')}</Text>            </Pressable>
          </>
        )}
      </View>
    );
  }

  const toCountry = getCountry(transfer.to_country);
  const fromCountry = getCountry(transfer.from_country);
  const status = STATUS_META[transfer.status];
  const reference = `TX-${transfer.id.slice(0, 8).toUpperCase()}`;
  const isSimulated = transfer.payout_reference?.startsWith('SIMULATED-') ?? false;
  const total = transfer.amount_sent + transfer.fee;

  return (
    <View style={{ flex: 1, backgroundColor: NAVY }}>
      <StatusBar style="light" />

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 6 }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="x" size={18} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }} style={{ backgroundColor: NAVY, padding: 18 }}>
          <View style={{ backgroundColor: '#fff', paddingHorizontal: 22, paddingVertical: 34 }}>
            <Scallops edge="top" />
            <Scallops edge="bottom" />

            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 34, fontWeight: '900', fontStyle: 'italic', color: INK, letterSpacing: -1 }}>Oti</Text>
              <Text style={{ fontSize: 34, fontWeight: '900', fontStyle: 'italic', color: GOLD, letterSpacing: -1 }}>Pay</Text>
            </View>

            <Text style={{ fontSize: 26, fontWeight: '800', color: INK, marginTop: 26 }}>Money Transfer</Text>
            <Text style={{ fontSize: 13.5, color: LABEL, marginTop: 8 }}>
              {t('transactionDetail.refLine', { reference, stamp: formatStamp(transfer.created_at, i18n.language, t) })}
            </Text>

            <View style={{ height: 1, backgroundColor: HAIRLINE, marginTop: 18, marginBottom: 22 }} />

            <View style={{ paddingLeft: 16 }}>
              <Field label="Recipient">
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#EAF0FA', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                    <Text style={{ color: INK, fontWeight: '800', fontSize: 12 }}>{initials(transfer.recipient_name)}</Text>
                  </View>
                  <Value>{transfer.recipient_name}</Value>
                </View>
              </Field>

              <Field label="Recipient number">
                <Value>{transfer.recipient_phone}</Value>
              </Field>

              <Field label="Corridor">
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {fromCountry.code ? <CountryFlag isoCode={fromCountry.code} size={18} /> : null}
                  <Text style={{ color: INK, fontSize: 19, fontWeight: '600', marginHorizontal: 8 }}>{fromCountry.name}</Text>
                  <Feather name="arrow-right" size={16} color={INK} />
                  <View style={{ width: 8 }} />
                  {toCountry.code ? <CountryFlag isoCode={toCountry.code} size={18} /> : null}
                  <Text style={{ color: INK, fontSize: 19, fontWeight: '600', marginLeft: 8 }}>{toCountry.name}</Text>
                </View>
              </Field>

              {transfer.network ? (
                <Field label="Network">
                  <Value>{NETWORK_LABELS[transfer.network] ?? transfer.network}</Value>
                </Field>
              ) : null}

              <Field label="Status">
                <Value color={status.color}>{status.label}</Value>
              </Field>

              <Field label="Amount sent">
                <Value>{formatRate(transfer.amount_sent)} {fromCountry.currency_code}</Value>
              </Field>

              <Field label="Fee">
                <Value>{formatRate(transfer.fee)} {fromCountry.currency_code}</Value>
              </Field>

              <Field label="Exchange rate">
                <Value>1 {fromCountry.currency_code} = {formatRate(transfer.rate_used)} {toCountry.currency_code}</Value>
              </Field>

              <Field label="Recipient receives">
                <Value>{formatRate(transfer.amount_received)} {toCountry.currency_code}</Value>
              </Field>

              {transfer.collection_reference ? (
                <Field label="Collection reference">
                  <Value size={14}>{transfer.collection_reference}</Value>
                </Field>
              ) : null}

              {transfer.payout_reference ? (
                <Field label="Payout reference">
                  <Value size={14} color={isSimulated ? '#B45309' : undefined}>{transfer.payout_reference}</Value>
                </Field>
              ) : null}
            </View>

            <View style={{ height: 1, backgroundColor: HAIRLINE, marginBottom: 20 }} />

            <View style={{ paddingLeft: 16 }}>
              <Text style={{ color: LABEL, fontSize: 13.5, fontWeight: '500' }}>Total Amount</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
                <Text style={{ color: INK, fontSize: 44, fontWeight: '800' }}>{formatRate(total)}</Text>
                <Text style={{ color: INK, fontSize: 24, fontWeight: '700', marginLeft: 8 }}>{fromCountry.currency_code}</Text>
              </View>
            </View>
          </View>
        </ViewShot>
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 14, paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 12 }}>
        <ActionPill icon="download" label="Download" onPress={handleDownload} loading={busy === 'download'} disabled={busy !== null} />
        <ActionPill icon="share-2" label="Share" onPress={handleShare} loading={busy === 'share'} disabled={busy !== null} />
      </View>
    </View>
  );
}