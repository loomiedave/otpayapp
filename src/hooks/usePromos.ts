import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export interface PromoRow {
  id: string;
  title_en: string;
  title_fr: string | null;
  subtitle_en: string | null;
  subtitle_fr: string | null;
  icon: string | null;
  image_url: string | null;
  link: string | null;
}

export function usePromos(): PromoRow[] {
  const [promos, setPromos] = useState<PromoRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('promos')
      .select('id,title_en,title_fr,subtitle_en,subtitle_fr,icon,image_url,link')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (!cancelled && data) setPromos(data as PromoRow[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return promos;
}
