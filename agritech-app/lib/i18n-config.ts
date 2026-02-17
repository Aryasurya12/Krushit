import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from '../public/locales/en.json';
import hi from '../public/locales/hi.json';
import mr from '../public/locales/mr.json';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr },
};

// Get saved language from localStorage or default to Hindi (most common in rural India)
const savedLanguage = typeof window !== 'undefined'
    ? localStorage.getItem('language') || 'hi'
    : 'hi';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('language', lng);
    }
});

export default i18n;
