export type TransferStatus = 'pending_verification' | 'confirmed' | 'paid_out' | 'failed';

export type Transfer = {
    id: string;
    recipient_name: string;
    to_country: string;
    from_country: string;
    amount_sent: number;
    amount_received: number;
    status: TransferStatus;
    created_at: string;
  }