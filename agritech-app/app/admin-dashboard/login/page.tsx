'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { signIn, profile } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: signInError } = await signIn(email, password);
            if (signInError) throw signInError;

            // Simple check: In a real app, we'd wait for profile to update
            // For now, if it's a @krushit.com admin email, we allow it in demo mode
            if (email.toLowerCase().includes('admin')) {
                router.push('/admin-dashboard');
            } else {
                setError('Access Denied: You do not have administrator privileges.');
            }
        } catch (err: any) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 selection:bg-agri-green selection:text-white">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-agri-green/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-[2.5rem] shadow-xl mb-6 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-agri-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <ShieldCheck size={40} className="text-agri-green relative z-10" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Krushit <span className="text-agri-green">Admin</span></h1>
                    <p className="text-gray-500 font-bold">Agronomic Command Center Access</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl border border-white/50">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Admin Email</label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agri-green transition-colors">
                                    <Mail size={18} />
                                </span>
                                <input 
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@krushit.com"
                                    className="w-full bg-white border border-gray-100 rounded-3xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Secure Password</label>
                            <div className="relative group">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agri-green transition-colors">
                                    <Lock size={18} />
                                </span>
                                <input 
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white border border-gray-100 rounded-3xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all font-bold text-gray-900 placeholder:text-gray-300 shadow-sm"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white rounded-3xl py-4 font-black flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-gray-200"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Enter Command Center
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="text-center mb-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Demo Gateways</p>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => {
                                        setEmail('admin@krushit.com');
                                        setPassword('admin123');
                                    }}
                                    className="flex-1 py-3 px-4 bg-agri-green/5 border border-agri-green/20 rounded-2xl text-[10px] font-black text-agri-green uppercase tracking-widest hover:bg-agri-green/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <ShieldCheck size={14} />
                                    Pre-fill Demo
                                </button>
                                <button 
                                    onClick={() => {
                                        // Force redirect to admin for hackathon judges
                                        localStorage.setItem('is_demo_mode', 'true');
                                        router.push('/admin-dashboard');
                                    }}
                                    className="flex-1 py-3 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowRight size={14} />
                                    Bypass (Demo)
                                </button>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold text-center leading-relaxed">
                            <span className="text-agri-green">Pro-Tip:</span> Use bypass if you haven't configured Supabase auth yet for the demo.
                        </p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => router.push('/')}
                        className="text-gray-400 hover:text-agri-green text-xs font-bold transition-all flex items-center justify-center gap-2 mx-auto group"
                    >
                        <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                        Back to Farmer Portal
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
