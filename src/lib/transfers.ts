import { supabase } from './supabase';

type CreateTransferInput = {
  senderId: string;
  recipientName: string;
  recipientPhone: string;
  fromCountry: string;
  toCountry: string;
  amountSent: number;
  rate: number;
};

export async function createTransfer(input: CreateTransferInput) {
  const amountReceived = (input.amountSent) * input.rate;

  const { data, error } = await supabase
    .from('transfers')
    .insert({
      sender_id: input.senderId,
      recipient_name: input.recipientName,
      recipient_phone: input.recipientPhone,
      from_country: input.fromCountry,
      to_country: input.toCountry,
      amount_sent: input.amountSent,
      rate_used: input.rate,
      amount_received: amountReceived,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
