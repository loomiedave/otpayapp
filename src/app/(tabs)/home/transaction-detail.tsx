import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import CountryFlag from 'react-native-country-flag';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';

import { supabase } from '@/lib/supabase';
import { formatRate } from '@/lib/currency';

import { useCountries } from '@/hooks/useCountries';

import { Transfer, TransferStatus } from '@/types/transactions';

// CHANGED: light colours only (no more navy background)
const BG = '#F1F5F9'; // page background, also the colour of the punched-out edges
const CARD = '#FFFFFF'; // the receipt itself
const INK = '#0B2A66'; // main text
const LABEL = '#64748B'; // small grey labels
const HAIRLINE = '#E2E8F0'; // thin divider lines
const GOLD = '#D4A62B';
const SCALLOP = 10; // CHANGED: was 14, smaller edge circles

// CHANGED: "label" renamed to "labelKey": it holds a translation KEY, translated where it is shown
const STATUS_META: Record<TransferStatus, { labelKey: string; color: string }> = {
  pending_verification: { labelKey: 'transactionDetail.statusPendingVerification', color: '#B45309' },
  confirmed: { labelKey: 'transactionDetail.statusConfirmed', color: '#B45309' },
  paid_out: { labelKey: 'transactionDetail.statusPaidOut', color: '#15803D' },
  failed: { labelKey: 'transactionDetail.statusFailed', color: '#B91C1C' },
};

const NETWORK_LABELS: Record<string, string> = { mtn: 'MTN MoMo', flooz: 'Flooz', tmoney: 'T-Money' };

// NEW: one text style for all values, so sizes stay consistent
const valueStyle = { color: INK, fontSize: 14, fontWeight: '600' as const };

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

function formatStamp(iso: string, locale: string, t: (key: string, options?: any) => string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }); // CHANGED: seconds removed, shorter line
  return t('transactionDetail.dateAt', { date, time });
}

// NEW: money format. XOF has no decimals, others have 2. Follows the app language (French: 1 250,50)
function formatAmount(value: number, currencyCode: string, locale: string): string {
  const decimals = currencyCode === 'XOF' ? 0 : 2;
  return value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
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
      {Array.from({ length: 20 }).map((_, i) => (
        // CHANGED: circles use the page colour (BG), so they look like holes punched in the card
        <View key={i} style={{ width: SCALLOP, height: SCALLOP, borderRadius: SCALLOP / 2, backgroundColor: BG }} />
      ))}
    </View>
  );
}

// CHANGED: "Field" (label above value) became "Row" (label left, value right), much more compact
function Row({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: HAIRLINE,
      }}
    >
      <Text style={{ color: LABEL, fontSize: 13, marginRight: 16 }}>{label}</Text>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>{children}</View>
    </View>
  );
}

function Value({ children, color, size }: { children: React.ReactNode; color?: string; size?: number }) {
  return (
    <Text style={[valueStyle, { textAlign: 'right' }, color ? { color } : null, size ? { fontSize: size } : null]}>
      {children}
    </Text>
  );
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
        height: 46, // CHANGED: was 50
        borderRadius: 23,
        backgroundColor: CARD,
        borderWidth: 1, // CHANGED: thin border, because the page is now light
        borderColor: HAIRLINE,
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
          <Feather name={icon} size={16} color={INK} style={{ marginRight: 8 }} />
          <Text style={{ color: INK, fontSize: 14, fontWeight: '600' }}>{label}</Text>
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
      // CHANGED: light background, dark status bar icons
      <View style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="dark" />
        {loading ? (
          <ActivityIndicator color={INK} />
        ) : (
          <>
            <Text style={{ color: INK, marginBottom: 16 }}>{t('transactionDetail.notFound')}</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={{ color: INK, fontWeight: '700' }}>{t('transactionDetail.goBack')}</Text>
            </Pressable>
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
  const locale = i18n.language; // NEW: used for dates and money
  // CHANGED: rounded to cents so 100 + 2.1 can never show as 102.10000000000001
  const total = Math.round((transfer.amount_sent + transfer.fee) * 100) / 100;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar style="dark" />

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 4 }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('lock.close')}
          style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="x" size={16} color={INK} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        {/* CHANGED: capture background is the light page colour, so the shared image is light too */}
        <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }} style={{ backgroundColor: BG, padding: 16 }}>
          <View style={{ backgroundColor: CARD, paddingHorizontal: 20, paddingVertical: 26 }}>
            <Scallops edge="top" />
            <Scallops edge="bottom" />

            {/* Header: logo on the left, status pill on the right */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={{ fontSize: 24, fontWeight: '900', fontStyle: 'italic', color: INK, letterSpacing: -0.5 }}>Oti</Text>
                <Text style={{ fontSize: 24, fontWeight: '900', fontStyle: 'italic', color: GOLD, letterSpacing: -0.5 }}>Pay</Text>
              </View>
              {/* NEW: status is a small coloured pill. "1A" makes the colour 10% see-through for the background */}
              <View style={{ backgroundColor: `${status.color}1A`, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: status.color, fontSize: 12, fontWeight: '700' }}>{t(status.labelKey)}</Text>
              </View>
            </View>

            {/* CHANGED: "Money Transfer" is translated now and smaller (was 26) */}
            <Text style={{ fontSize: 17, fontWeight: '800', color: INK, marginTop: 18 }}>{t('transactionDetail.moneyTransfer')}</Text>
            <Text style={{ fontSize: 12, color: LABEL, marginTop: 4 }}>
              {t('transactionDetail.refLine', { reference, stamp: formatStamp(transfer.created_at, locale, t) })}
            </Text>

            <View style={{ height: 1, backgroundColor: HAIRLINE, marginTop: 14, marginBottom: 14 }} />

            {/* CHANGED: recipient name and phone together in one block */}
            <Text style={{ color: LABEL, fontSize: 12, marginBottom: 8 }}>{t('transactionDetail.recipient')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#EAF0FA', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: INK, fontWeight: '800', fontSize: 13 }}>{initials(transfer.recipient_name)}</Text>
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ color: INK, fontSize: 16, fontWeight: '700' }}>{transfer.recipient_name}</Text>
                <Text style={{ color: LABEL, fontSize: 13, marginTop: 2 }}>{transfer.recipient_phone}</Text>
              </View>
            </View>

            <Row label={t('transactionDetail.corridor')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {fromCountry.code ? <CountryFlag isoCode={fromCountry.code} size={14} /> : null}
                <Text style={[valueStyle, { marginHorizontal: 6 }]}>{fromCountry.name}</Text>
                <Feather name="arrow-right" size={13} color={INK} />
                <View style={{ width: 6 }} />
                {toCountry.code ? <CountryFlag isoCode={toCountry.code} size={14} /> : null}
                <Text style={[valueStyle, { marginLeft: 6 }]}>{toCountry.name}</Text>
              </View>
            </Row>

            {transfer.network ? (
              <Row label={t('transactionDetail.network')}>
                <Value>{NETWORK_LABELS[transfer.network] ?? transfer.network}</Value>
              </Row>
            ) : null}

            {/* CHANGED: money now uses formatAmount, so 5000 XOF no longer shows as "5000.0" */}
            <Row label={t('transactionDetail.amountSent')}>
              <Value>{formatAmount(transfer.amount_sent, fromCountry.currency_code, locale)} {fromCountry.currency_code}</Value>
            </Row>

            <Row label={t('transactionDetail.fee')}>
              <Value>{formatAmount(transfer.fee, fromCountry.currency_code, locale)} {fromCountry.currency_code}</Value>
            </Row>

            <Row label={t('transactionDetail.exchangeRate')}>
              <Value>1 {fromCountry.currency_code} = {formatRate(transfer.rate_used)} {toCountry.currency_code}</Value>
            </Row>

            <Row label={t('transactionDetail.recipientReceives')} last={!transfer.collection_reference && !transfer.payout_reference}>
              <Value color="#15803D">{formatAmount(transfer.amount_received, toCountry.currency_code, locale)} {toCountry.currency_code}</Value>
            </Row>

            {transfer.collection_reference ? (
              <Row label={t('transactionDetail.collectionReference')} last={!transfer.payout_reference}>
                <Value size={12}>{transfer.collection_reference}</Value>
              </Row>
            ) : null}

            {transfer.payout_reference ? (
              <Row label={t('transactionDetail.payoutReference')} last>
                <Value size={12} color={isSimulated ? '#B45309' : undefined}>{transfer.payout_reference}</Value>
              </Row>
            ) : null}

            <View style={{ height: 1, backgroundColor: HAIRLINE, marginTop: 6, marginBottom: 14 }} />

            {/* CHANGED: total is one line (label left, amount right) and much smaller (was 44) */}
            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <Text style={{ color: LABEL, fontSize: 13, fontWeight: '500' }}>{t('transactionDetail.totalAmount')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={{ color: INK, fontSize: 24, fontWeight: '800' }}>{formatAmount(total, fromCountry.currency_code, locale)}</Text>
                <Text style={{ color: INK, fontSize: 14, fontWeight: '700', marginLeft: 6 }}>{fromCountry.currency_code}</Text>
              </View>
            </View>
          </View>
        </ViewShot>
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: insets.bottom + 12 }}>
        <ActionPill icon="download" label={t('transactionDetail.download')} onPress={handleDownload} loading={busy === 'download'} disabled={busy !== null} />
        <ActionPill icon="share-2" label={t('transactionDetail.share')} onPress={handleShare} loading={busy === 'share'} disabled={busy !== null} />
      </View>
    </View>
  );
}