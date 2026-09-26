import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface SupportMessage {
  id: string;
  sender: 'user' | 'admin' | 'bot';
  body: string;
  created_at: string;
}

export function useSupportChat() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('support_messages')
      .select('id, sender, body, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (!error && data) setMessages(data as SupportMessage[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) return;
    load();
    const channel = supabase
      .channel(`support_messages_${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `user_id=eq.${userId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as SupportMessage])
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const sendMessage = async (body: string) => {
    if (!userId || !body.trim()) return;
    await supabase.from('support_messages').insert({ user_id: userId, sender: 'user', body: body.trim() });
  };

  return { messages, loading, sendMessage };
}
