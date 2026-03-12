'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n-config';
import { useEffect, useState } from 'react';

/**
 * I18nProvider bootstraps react-i18next for the whole app.
 *
 * Key behaviours:
 * 1. On mount it reloads whatever language is in localStorage (fixes SSR mismatch).
 * 2. It wraps the whole tree in <I18nextProvider> so every `useTranslation()` 
 *    hook re-renders automatically when `i18n.changeLanguage()` is called anywhere.
 */
export default function I18nProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // After hydration, sync the language from localStorage to the i18n instance.
        // This fixes the SSR mismatch where the module was initialised before
        // localStorage was available.
        try {
            const stored = localStorage.getItem('krushit_language');
            if (stored && stored !== i18n.language) {
                i18n.changeLanguage(stored);
            }
        } catch {
            // Ignore – storage might be blocked
        }
        setMounted(true);
    }, []);

    // Render children immediately so there's no flash of missing content.
    // Before mount, i18n still works (it falls back to English), so we skip
    // the "return null" pattern that was causing missed re-renders.
    return (
        <I18nextProvider i18n={i18n}>
            {mounted ? children : (
                // Render children even pre-mount so Next.js SSR can hydrate correctly.
                // The language will correct itself in the useEffect above.
                <>{children}</>
            )}
        </I18nextProvider>
    );
}
