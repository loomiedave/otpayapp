import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import your language JSON translation files
//import en from './locales/en.json';
//import es from './locales/es.json';

export type Language = 'en' | 'es';

i18n.use(initReactI18next).init({
  resources: {
  //  en: { translation: en },
    //es: { translation: es },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React handles XSS prevention
  },
});

export default i18n;
