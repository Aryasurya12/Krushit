'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n-config';
import { useEffect, useState } from 'react';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Initialize i18n
        const timer = setTimeout(() => setIsReady(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!isReady) {
        return null; // or a loading spinner
    }

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
