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

// Get saved language from localStorage or default to English
// We do this safely — localStorage is only available on the client.
const getInitialLanguage = (): string => {
    if (typeof window === 'undefined') return 'en';
    try {
        return localStorage.getItem('krushit_language') || 'en';
    } catch {
        return 'en';
    }
};

// Only initialize once (i18next is a singleton module)
if (!i18n.isInitialized) {
    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: getInitialLanguage(),
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false,
            },
            react: {
                useSuspense: false,
                // This is what makes ALL components re-render on language change
                bindI18n: 'languageChanged loaded',
                bindI18nStore: 'added',
                nsMode: 'default',
            },
        });
}

// Persist language selection whenever it changes (and debug log)
i18n.on('languageChanged', (lng) => {
    console.log(`[Krushit i18n] Language changed to: ${lng}`);
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('krushit_language', lng);
        } catch {
            // Ignore storage errors
        }
    }
});

export default i18n;
