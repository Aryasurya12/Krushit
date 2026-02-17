'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next'; // Import useTranslation

export default function LoginPage() {
    const { t } = useTranslation(); // Hook
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await signIn(email, password);
            if (error) {
                // Check if it's the demo credentials (fallback)
                if (email.trim().toLowerCase() === 'demo@krushit.com' && password === 'demo123') {
                    router.push('/dashboard-farmer');
                    return;
                }
                setError(typeof error === 'string' ? error : error.message || t('common.error'));
            } else {
                router.push('/dashboard-farmer');
            }
        } catch (err: unknown) {
            if (email.trim().toLowerCase() === 'demo@krushit.com' && password === 'demo123') {
                router.push('/dashboard-farmer');
                return;
            }
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(t('common.error'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-agri-cream flex items-center justify-center p-6 relative overflow-hidden font-sans">

            {/* Background Texture */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-gradient-to-bl from-agri-green/10 to-transparent blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-accent-yellow/5 to-transparent blur-[100px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[440px] bg-white/80 backdrop-blur-xl rounded-[32px] shadow-glass border border-white/50 p-10 relative z-10"
            >
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-agri-green to-primary-600 rounded-xl shadow-lg shadow-agri-green/20 flex items-center justify-center text-2xl text-white group-hover:scale-110 transition-transform duration-300">
                            🌱
                        </div>
                        <h1 className="text-2xl font-bold font-display text-agri-dark tracking-tight group-hover:text-agri-green transition-colors">Krushit</h1>
                    </Link>
                    <h2 className="text-3xl font-bold text-agri-dark font-display mb-2">{t('auth.welcomeBack')}</h2>
                    <p className="text-agri-dark/50 font-medium">{t('auth.enterDetails')}</p>
                </div>

                {/* Error State */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-2xl mb-6 border border-red-100 flex items-center gap-3"
                    >
                        <span className="text-lg">⚠️</span> {error}
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-agri-dark/70 ml-1">{t('auth.email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-white border border-agri-sage rounded-2xl text-agri-dark placeholder:text-agri-dark/30 focus:outline-none focus:border-agri-green focus:ring-4 focus:ring-agri-green/10 transition-all font-medium"
                            placeholder="name@farm.com"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between ml-1">
                            <label className="text-sm font-bold text-agri-dark/70">{t('auth.password')}</label>
                            {/* <Link href="/auth/forgot-password" className="text-xs font-bold text-agri-green hover:underline">{t('auth.forgotPassword')}</Link> */}
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-white border border-agri-sage rounded-2xl text-agri-dark placeholder:text-agri-dark/30 focus:outline-none focus:border-agri-green focus:ring-4 focus:ring-agri-green/10 transition-all font-medium"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 text-lg mt-4 shadow-elevated hover:shadow-xl"
                    >
                        {loading ? t('auth.processing') : t('auth.signIn')}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-agri-sage text-center">
                    <p className="text-sm text-agri-dark/50">
                        {t('auth.noAccount')}{' '}
                        <Link href="/auth/register" className="text-agri-green font-bold hover:underline">
                            {t('auth.createAccount')}
                        </Link>
                    </p>
                </div>

                {/* Demo Hint with Click-to-Fill */}
                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setEmail('demo@krushit.com');
                            setPassword('demo123');
                        }}
                        className="text-[10px] font-mono bg-agri-sage/50 text-agri-dark/60 px-3 py-1 rounded-full border border-agri-sage hover:bg-agri-sage hover:text-agri-dark transition-colors"
                    >
                        {t('auth.demoHint')}
                    </button>
                </div>
            </motion.div>
        </main>
    );
}
