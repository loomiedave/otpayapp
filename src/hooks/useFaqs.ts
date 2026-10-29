import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export interface FaqRow {
  id: string;
  question_en: string;
  question_fr: string | null;
  answer_en: string;
  answer_fr: string | null;
}

export function useFaqs(): FaqRow[] {
  const [faqs, setFaqs] = useState<FaqRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('faqs')
      .select('id,question_en,question_fr,answer_en,answer_fr')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (!cancelled && data) setFaqs(data as FaqRow[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return faqs;
}
