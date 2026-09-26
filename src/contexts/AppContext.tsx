import React, { createContext, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '@/constants/i18n';

interface AppContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: Record<string, any>) => string;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { t: i18nTranslate, i18n } = useTranslation();

  const setLanguage = useCallback(
    (lang: Language) => {
      i18n.changeLanguage(lang);
    },
    [i18n]
  );

  const t = useCallback(
    (key: string, options?: Record<string, any>) => {
      return i18nTranslate(key, options);
    },
    [i18nTranslate]
  );

  return (
    <AppContext.Provider
      value={{
        language: (i18n.resolvedLanguage || i18n.language) as Language,
        setLanguage,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
