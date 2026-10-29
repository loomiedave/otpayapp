import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library/legacy';
import CountryFlag from 'react-native-country-flag';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';

import { supabase } from '@/lib/supabase';
import { formatRate } from '@/lib/currency';

import { useCountries } from '@/hooks/useCountries';
import { useThemeColors } from '@/hooks/useThemeColors';

import { Transfer, TransferStatus } from '@/types/transactions';

const SCALLOP = 10; // size of the punched-out circles on the card edges

// Each status holds Tailwind class names from your theme:
// "pill" = soft background (10% of the color), "text" = the color itself
const STATUS_META: Record<TransferStatus, { labelKey: string; pill: string; text: string }> = {
  pending_verification: { labelKey: 'transactionDetail.statusPendingVerification', pill: 'bg-warning/10', text: 'text-warning' },
  confirmed: { labelKey: 'transactionDetail.statusConfirmed', pill: 'bg-warning/10', text: 'text-warning' },
  paid_out: { labelKey: 'transactionDetail.statusPaidOut', pill: 'bg-success/10', text: 'text-success' },
  failed: { labelKey: 'transactionDetail.statusFailed', pill: 'bg-danger/10', text: 'text-danger' },
};

const NETWORK_LABELS: Record<string, string> = { mtn: 'MTN MoMo', flooz: 'Flooz', tmoney: 'T-Money' };

function formatStamp(iso: string, locale: string, t: (key: string, options?: any) => string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return t('transactionDetail.dateAt', { date, time });
}

// XOF has no decimals, other currencies have 2. Follows the app language (French: 1 250,50)
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
        // The circles use the page color from your theme, so they look like holes in the card
        <View
          key={i}
          className="bg-background-main"
          style={{ width: SCALLOP, height: SCALLOP, borderRadius: SCALLOP / 2 }}
        />
      ))}
    </View>
  );
}

function Row({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View className={`flex-row items-center justify-between py-2.5 ${last ? '' : 'border-b border-border-main'}`}>
      <Text className="text-text-muted text-xs mr-4">{label}</Text>
      <View className="flex-1 items-end">{children}</View>
    </View>
  );
}

// "className" lets you pass a theme class like "text-success"
function Value({ children, className, small }: { children: React.ReactNode; className?: string; small?: boolean }) {
  return (
    <Text className={`${small ? 'text-xs' : 'text-sm'} font-semibold text-right ${className ?? 'text-text-main'}`}>
      {children}
    </Text>
  );
}

function ActionPill({
  icon, label, onPress, loading, disabled, iconColor,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
  iconColor: string;
}) {
  return (
    // Only className here (no function style), which avoids the NativeWind size bug from the PIN pad
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-1 h-12 rounded-full bg-background-card border border-border-main flex-row items-center justify-center active:opacity-70 ${disabled ? 'opacity-60' : ''}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <>
          <Feather name={icon} size={16} color={iconColor} style={{ marginRight: 8 }} />
          <Text className="text-text-main text-sm font-semibold">{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export default function TransactionDetailScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
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
    if (transfer?.status !== 'paid_out') return; // only completed transfers can be shared
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
    if (transfer?.status !== 'paid_out') return; // only completed transfers can be saved
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
      <View className="flex-1 bg-background-main items-center justify-center">
        <StatusBar style="dark" />
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Text className="text-text-main mb-4">{t('transactionDetail.notFound')}</Text>
            <Pressable onPress={() => router.back()}>
              <Text className="text-primary font-bold">{t('transactionDetail.goBack')}</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  const toCountry = getCountry(transfer.to_country);
  const fromCountry = getCountry(transfer.from_country);
  const status = STATUS_META[transfer.status];
  // NEW: a receipt only makes sense once the money has arrived ("Completed")
  const canShareReceipt = transfer.status === 'paid_out';
  const reference = `TX-${transfer.id.slice(0, 8).toUpperCase()}`;
  const isSimulated = transfer.payout_reference?.startsWith('SIMULATED-') ?? false;
  const locale = i18n.language;
  const total = Math.round((transfer.amount_sent + transfer.fee) * 100) / 100;

  return (
    <View className="flex-1 bg-background-main">
      <StatusBar style="dark" />

      <View className="flex-row justify-end px-5 pb-1" style={{ paddingTop: insets.top + 8 }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('lock.close')}
          className="w-8 h-8 rounded-full border border-border-main items-center justify-center"
        >
          <Feather name="x" size={16} color={colors.iconMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        {/* ViewShot can't take className, so the page-colored wrapper is a normal View inside it.
            This also makes the saved/shared image use the same light background. */}
        <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }}>
          <View className="bg-background-main p-4">
            <View className="bg-background-card px-5 py-6">
              <Scallops edge="top" />
              <Scallops edge="bottom" />

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-baseline">
                  {/* Logo colors come from your theme (primary + accent) */}
                  <Text className="text-primary text-2xl font-black italic" style={{ letterSpacing: -0.5 }}>OT</Text>
                  <Text className="text-accent text-2xl font-black italic" style={{ letterSpacing: -0.5 }}>Pay</Text>
                </View>
                <View className='rounded-full px-2.5 py-1'>
                  <Text className={`${status.text} text-xs font-bold`}>{t(status.labelKey)}</Text>
                </View>
              </View>

              <Text className="text-text-main text-base font-extrabold mt-4">{t('transactionDetail.moneyTransfer')}</Text>
              <Text className="text-text-muted text-xs mt-1">
                {t('transactionDetail.refLine', { reference, stamp: formatStamp(transfer.created_at, locale, t) })}
              </Text>

              <View className="h-px bg-border-main my-3.5" />

              <Text className="text-text-muted text-xs mb-2">{t('transactionDetail.recipient')}</Text>
              <View className="flex-row items-center mb-1.5">
                <View className="ml-3 flex-1">
                  <Text className="text-text-main text-base font-bold">{transfer.recipient_name}</Text>
                  <Text className="text-text-muted text-xs mt-0.5">{transfer.recipient_phone}</Text>
                </View>
              </View>

              <Row label={t('transactionDetail.corridor')}>
                <View className="flex-row items-center flex-wrap justify-end">
                  {fromCountry.code ? <CountryFlag isoCode={fromCountry.code} size={14} /> : null}
                  <Text className="text-text-main text-sm font-semibold mx-1.5">{fromCountry.name}</Text>
                  <Feather name="arrow-right" size={13} color={colors.iconMuted} />
                  <View style={{ width: 6 }} />
                  {toCountry.code ? <CountryFlag isoCode={toCountry.code} size={14} /> : null}
                  <Text className="text-text-main text-sm font-semibold ml-1.5">{toCountry.name}</Text>
                </View>
              </Row>

              {transfer.network ? (
                <Row label={t('transactionDetail.network')}>
                  <Value>{NETWORK_LABELS[transfer.network] ?? transfer.network}</Value>
                </Row>
              ) : null}

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
                <Value className="text-success">{formatAmount(transfer.amount_received, toCountry.currency_code, locale)} {toCountry.currency_code}</Value>
              </Row>

              {transfer.collection_reference ? (
                <Row label={t('transactionDetail.collectionReference')} last={!transfer.payout_reference}>
                  <Value small>{transfer.collection_reference}</Value>
                </Row>
              ) : null}

              {transfer.payout_reference ? (
                <Row label={t('transactionDetail.payoutReference')} last>
                  <Value small className={isSimulated ? 'text-warning' : undefined}>{transfer.payout_reference}</Value>
                </Row>
              ) : null}

              <View className="h-px bg-border-main mt-1.5 mb-3.5" />

              <View className="flex-row items-baseline justify-between">
                <Text className="text-text-muted text-sm font-medium">{t('transactionDetail.totalAmount')}</Text>
                <View className="flex-row items-baseline">
                  <Text className="text-text-main text-2xl font-extrabold">{formatAmount(total, fromCountry.currency_code, locale)}</Text>
                  <Text className="text-text-main text-sm font-bold ml-1.5">{fromCountry.currency_code}</Text>
                </View>
              </View>
            </View>
          </View>
        </ViewShot>
      </ScrollView>

      {/* CHANGED: buttons only for completed transfers, otherwise a short note */}
      {canShareReceipt ? (
        <View className="flex-row px-5 pt-2" style={{ gap: 12, paddingBottom: insets.bottom + 12 }}>
          <ActionPill icon="download" label={t('transactionDetail.download')} onPress={handleDownload} loading={busy === 'download'} disabled={busy !== null} iconColor={colors.primary} />
          <ActionPill icon="share-2" label={t('transactionDetail.share')} onPress={handleShare} loading={busy === 'share'} disabled={busy !== null} iconColor={colors.primary} />
        </View>
      ) : (
        <View className="px-5 pt-2" style={{ paddingBottom: insets.bottom + 16 }}>
          <Text className="text-text-muted text-xs text-center">{t('transactionDetail.receiptUnavailable')}</Text>
        </View>
      )}
    </View>
  );
}
