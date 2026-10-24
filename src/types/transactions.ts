export type TransferStatus = 'pending_verification' | 'confirmed' | 'paid_out' | 'failed';

export type Transfer = {
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