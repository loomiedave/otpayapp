import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import CountryFlag from 'react-native-country-flag';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { useCountries } from '@/hooks/useCountries';
import { formatRate } from '@/lib/currency';

const ACCENT_GOLD = '#D4A62B';

type TransferStatus = 'pending_verification' | 'confirmed' | 'paid_out' | 'failed';

interface Transfer {
  id: string;
  recipient_name: string;
  recipient_phone: string;
  from_country: string;
  to_country: string;
  network: string | null;
  amount_sent: number;
  amount_received: number;
  fee: number;
  rate_used: number;
  status: TransferStatus;
  collection_reference: string | null;
  payout_reference: string | null;
  created_at: string;
}

const STATUS_META: Record<TransferStatus, { color: string; label: string; icon: keyof typeof Feather.glyphMap }> = {
  pending_verification: { color: '#d97706', label: 'Pending verification', icon: 'clock' },
  confirmed: { color: '#d97706', label: 'Sending…', icon: 'send' },
  paid_out: { color: '#16a34a', label: 'Completed', icon: 'check' },
  failed: { color: '#dc2626', label: 'Failed', icon: 'x' },
};

const NETWORK_LABELS: Record<string, string> = {
  mtn: 'MTN MoMo',
  flooz: 'Flooz',
  tmoney: 'T-Money',
};

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

export default function TransactionDetailScreen(): React.JSX.Element {
  const { isDark } = useTheme();
  const { getCountry } = useCountries();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const shotRef = useRef<any>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from('transfers').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setTransfer(data as Transfer);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Transaction Details" />
        <View className="flex-1 items-center justify-center py-20"><ActivityIndicator /></View>
      </ScreenContainer>
    );
  }

  if (!transfer) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Transaction Details" />
        <View className="flex-1 items-center justify-center py-20">
          <Text className={isDark ? 'text-text-muted-dark' : 'text-text-muted'}>Transaction not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const toCountry = getCountry(transfer.to_country);
  const fromCountry = getCountry(transfer.from_country);
  const meta = STATUS_META[transfer.status];
  const reference = `TX-${transfer.id.slice(0, 8).toUpperCase()}`;
  const isSimulatedPayout = transfer.payout_reference ?? false;

  const receiptBg = isDark ? '#15191f' : '#ffffff';
  const dividerColor = isDark ? '#2a2f38' : '#e8e8ec';
  const mutedText = isDark ? '#8a8f98' : '#9a9da3';
  const mainText = isDark ? '#f4f4f5' : '#18181b';

  const handleShareImage = async (): Promise<void> => {
    if (!shotRef.current?.capture) return;
    setSharing(true);
    try {
      const uri = await shotRef.current.capture();
      const available = await Sharing.isAvailableAsync();
      if (available) await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share receipt' });
      else Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
    } catch {
      Alert.alert('Could not create receipt image', 'Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const Row = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
      <Text style={{ color: mutedText, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: valueColor ?? mainText, fontSize: 13, fontWeight: '600', maxWidth: 190 }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Transaction Details" />

      <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }}>
        <View style={{ backgroundColor: receiptBg, borderRadius: 24, paddingTop: 28, paddingBottom: 24, paddingHorizontal: 24 }}>

          {/* Brand mark */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: ACCENT_GOLD, fontWeight: '800', fontSize: 15, letterSpacing: 1 }}>OTIPAY</Text>
          </View>

          {/* Status icon */}
          <View style={{ alignItems: 'center', marginBottom: 14 }}>
            <View
              style={{
                width: 56, height: 56, borderRadius: 28,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: `${meta.color}1a`,
              }}
            >
              <Feather name={meta.icon} size={24} color={meta.color} />
            </View>
          </View>

          {/* Big amount */}
          <View style={{ alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ color: mainText, fontSize: 40, fontWeight: '800', letterSpacing: -0.5 }}>
              {formatRate(transfer.amount_received)}
            </Text>
            <Text style={{ color: mutedText, fontSize: 14, fontWeight: '600', marginTop: 2 }}>
              {toCountry.currency_code}
            </Text>
          </View>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: meta.color, fontSize: 13, fontWeight: '700' }}>{meta.label}</Text>
          </View>

          {/* Recipient */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <View
              style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: isDark ? '#2a2f38' : '#f0f0f3',
                alignItems: 'center', justifyContent: 'center', marginRight: 10,
              }}
            >
              <Text style={{ color: mainText, fontWeight: '700', fontSize: 13 }}>{initials(transfer.recipient_name)}</Text>
            </View>
            <View>
              <Text style={{ color: mainText, fontWeight: '700', fontSize: 15 }}>{transfer.recipient_name}</Text>
              <Text style={{ color: mutedText, fontSize: 12 }}>{transfer.recipient_phone}</Text>
            </View>
          </View>

          {/* Route pill */}
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              backgroundColor: isDark ? '#1f242c' : '#f7f7f9',
              borderRadius: 100, paddingVertical: 8, marginBottom: 22, gap: 8,
            }}
          >
            {fromCountry.code && <CountryFlag isoCode={fromCountry.code} size={14} />}
            <Text style={{ color: mutedText, fontSize: 12, fontWeight: '600' }}>{fromCountry.name}</Text>
            <Feather name="arrow-right" size={12} color={mutedText} />
            {toCountry.code && <CountryFlag isoCode={toCountry.code} size={14} />}
            <Text style={{ color: mutedText, fontSize: 12, fontWeight: '600' }}>{toCountry.name}</Text>
          </View>

          {/* Dashed ticket divider */}
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {Array.from({ length: 28 }).map((_, i) => (
              <View key={i} style={{ flex: 1, height: 1, backgroundColor: i % 2 === 0 ? dividerColor : 'transparent' }} />
            ))}
          </View>

          {/* Details */}
          <Row label="Amount sent" value={`${formatRate(transfer.amount_sent)} ${fromCountry.currency_code}`} />
          <Row label="Fee" value={`${formatRate(transfer.fee)} ${fromCountry.currency_code}`} />
          <Row label="Exchange rate" value={`1 ${fromCountry.currency_code} = ${formatRate(transfer.rate_used)} ${toCountry.currency_code}`} />
          {transfer.network && <Row label="Network" value={NETWORK_LABELS[transfer.network] ?? transfer.network} />}
          <Row
            label="Date"
            value={new Date(transfer.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
          />
          {transfer.collection_reference && <Row label="Collection ref." value={transfer.collection_reference} />}
          {transfer.payout_reference && (
            <Row
              label="Payout ref."
              value={transfer.payout_reference}
              valueColor={isSimulatedPayout ? '#d97706' : undefined}
            />
          )}

          {/* Dashed divider */}
          <View style={{ flexDirection: 'row', marginTop: 16, marginBottom: 14 }}>
            {Array.from({ length: 28 }).map((_, i) => (
              <View key={i} style={{ flex: 1, height: 1, backgroundColor: i % 2 === 0 ? dividerColor : 'transparent' }} />
            ))}
          </View>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: mutedText, fontSize: 11, fontFamily: 'monospace', letterSpacing: 0.5 }}>
              {reference}
            </Text>
          </View>
        </View>
      </ViewShot>

      <Pressable
        onPress={handleShareImage}
        disabled={sharing}
        className="flex-row items-center justify-center mt-6 py-3 active:opacity-70"
        style={{ borderRadius: 14, backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}
      >
        {sharing ? (
          <ActivityIndicator size="small" />
        ) : (
          <>
            <Feather name="image" size={16} color={isDark ? '#e2e8f0' : '#334155'} style={{ marginRight: 8 }} />
            <Text className={isDark ? 'text-text-main-dark text-sm font-semibold' : 'text-text-main text-sm font-semibold'}>
              Share as Image
            </Text>
          </>
        )}
      </Pressable>
    </ScreenContainer>
  );
}