import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase'; // adjust to your client path

export interface SupportContactRow {
  id: string;
  type: 'email' | 'phone';
  value: string;
  label_en: string;
  label_fr: string | null;
}

export function useSupportContacts(): SupportContactRow[] {
  const [contacts, setContacts] = useState<SupportContactRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('support_contacts')
      .select('id,type,value,label_en,label_fr')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (!cancelled && data) setContacts(data as SupportContactRow[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return contacts;
}
