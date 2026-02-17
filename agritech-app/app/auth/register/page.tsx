'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signUp } = useAuth();
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await signUp(email, password, { full_name: name });
            if (error) {
                setError(typeof error === 'string' ? error : error.message || t('common.error'));
            } else {
                router.push('/dashboard-farmer');
            }
        } catch (err: unknown) {
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
        <main className="min-h-screen bg-white flex items-center justify-center p-4">

            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[50vh] h-full bg-green-50/50 skew-x-3 origin-top-right -z-10"></div>
                <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-green-100/30 rounded-full blur-[100px] -z-10"></div>
                <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[120px] -z-10"></div>
            </div>

            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10 relative z-10">

                {/* Header */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-green-200 group-hover:scale-105 transition-transform">
                            ✨
                        </div>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">Krushit</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.joinRevolution')}</h1>
                    <p className="text-gray-500">{t('auth.createFreeAccount')}</p>
                </div>

                {/* Error Box */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium border border-red-100 flex items-center gap-2"
                    >
                        <span>⚠️</span> {error}
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{t('auth.fullName')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-medium"
                            placeholder="Rajesh Kumar"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{t('auth.email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-medium"
                            placeholder="farmer@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{t('auth.password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-medium"
                            placeholder="Minimum 8 characters"
                            required
                            minLength={8}
                        />
                    </div>

                    <div className="flex items-start gap-3 mt-4">
                        <input type="checkbox" required className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300" />
                        <span className="text-sm text-gray-600">
                            {t('auth.terms')}
                        </span>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 hover:shadow-green-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                    >
                        {loading ? t('auth.processing') : <>🚀 {t('auth.startFarming')}</>}
                    </motion.button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    {t('auth.hasAccount')}{' '}
                    <Link href="/auth/login" className="text-green-600 font-bold hover:underline">
                        {t('auth.signIn')}
                    </Link>
                </div>
            </div>
        </main>
    );
}
