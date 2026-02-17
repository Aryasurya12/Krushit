'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import AIChatbot from '@/components/AIChatbot';
import {
    LayoutDashboard,
    Sprout,
    ScanLine,
    Droplets,
    CloudSun,
    Activity,
    Mic,
    Settings,
    LogOut,
    Menu,
    Bell,
    ChevronDown,
    Search,
    Users
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SidebarItem = ({ item, isActive, onClick, isVoice, voiceListening }: any) => {
    if (isVoice) {
        return (
            <button
                onClick={onClick}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm group ${voiceListening
                    ? 'bg-red-500/10 text-red-500 animate-pulse border border-red-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
            >
                <Mic size={20} className={voiceListening ? 'animate-pulse' : ''} />
                <span>{item.label}</span>
            </button>
        );
    }

    return (
        <Link href={item.href} onClick={onClick} className="block mb-1">
            <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm relative overflow-hidden group ${isActive
                    ? 'bg-agri-green text-white shadow-md'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
            >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-sm"></div>}

                <item.icon size={20} className={`relative z-10 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="relative z-10">{item.label}</span>
            </div>
        </Link>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SidebarContent = ({ navItems, currentPath, onItemClick, onVoiceClick, voiceListening, changeLanguage, currentLanguage, signOut, user, t }: any) => {
    return (
        <div className="flex flex-col h-full bg-[#1E2D24] text-white">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-agri-green to-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-agri-green/20">
                    <Sprout size={18} />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-white">Krushit <span className="text-agri-green font-normal">Pro</span></h1>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-0.5">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('layout.mainMenu')}</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {navItems.map((item: any, idx: number) => (
                    <SidebarItem
                        key={idx}
                        item={item}
                        isActive={currentPath === item.href}
                        onClick={item.isVoice ? onVoiceClick : onItemClick}
                        isVoice={item.isVoice}
                        voiceListening={voiceListening}
                    />
                ))}
            </nav>

            <div className="p-4 border-t border-white/10 bg-[#15201A]">
                <div className="flex bg-black/20 p-1 rounded-lg mb-4">
                    {['en', 'hi', 'mr'].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => changeLanguage(lang)}
                            className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all uppercase ${currentLanguage === lang
                                ? 'bg-agri-green text-white shadow-sm'
                                : 'text-gray-500 hover:text-white'}`}
                        >
                            {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-bold text-white border border-white/10">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.user_metadata?.full_name || t('layout.farmer')}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || 'user@krushit.com'}</p>
                    </div>
                    <button onClick={signOut} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function FarmerDashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [voiceListening, setVoiceListening] = useState(false);
    const pathname = usePathname();
    const { t, i18n } = useTranslation();
    const { user, signOut } = useAuth();
    const router = useRouter();

    const safeNavItems = useMemo(() => [
        { icon: LayoutDashboard, label: t('nav.home'), href: '/dashboard-farmer' },
        { icon: Sprout, label: t('nav.myCrop'), href: '/crops' },
        { icon: ScanLine, label: t('nav.scanCrop'), href: '/disease' },
        { icon: Droplets, label: t('nav.waterAdvice'), href: '/iot' },
        { icon: CloudSun, label: t('nav.weather'), href: '/weather' },
        { icon: Activity, label: t('nav.farmHealth'), href: '/recommendations' },
        { icon: Users, label: t('nav.community'), href: '/community' },
        { icon: Mic, label: t('nav.voiceHelp'), href: '#voice', isVoice: true },
        { icon: Settings, label: t('nav.settings'), href: '/settings' },
    ], [t]);

    const handleVoiceClick = useCallback(() => {
        setVoiceListening(true);
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'mr' ? 'mr-IN' : 'en-IN';
            recognition.start();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                setVoiceListening(false);
                if (transcript.includes('water') || transcript.includes('pani')) router.push('/iot');
                else if (transcript.includes('scan') || transcript.includes('check')) router.push('/disease');
                else if (transcript.includes('weather')) router.push('/weather');
            };
            recognition.onerror = () => setVoiceListening(false);
        } else {
            setTimeout(() => setVoiceListening(false), 2000);
        }
    }, [i18n.language, router]);

    const changeLanguage = useCallback((lng: string) => {
        i18n.changeLanguage(lng);
    }, [i18n]);

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900 selection:bg-agri-green/20">

            <aside className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 w-64 bg-[#1E2D24] border-r border-white/5 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'}`}>
                <SidebarContent
                    navItems={safeNavItems}
                    currentPath={pathname}
                    onVoiceClick={handleVoiceClick}
                    voiceListening={voiceListening}
                    changeLanguage={changeLanguage}
                    currentLanguage={i18n.language}
                    signOut={signOut}
                    user={user}
                    t={t}
                />
            </aside>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#1E2D24] shadow-2xl"
                        >
                            <SidebarContent
                                navItems={safeNavItems}
                                currentPath={pathname}
                                onItemClick={() => setMobileMenuOpen(false)}
                                onVoiceClick={handleVoiceClick}
                                voiceListening={voiceListening}
                                changeLanguage={changeLanguage}
                                currentLanguage={i18n.language}
                                signOut={signOut}
                                user={user}
                                t={t}
                            />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                            <Menu size={20} />
                        </button>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-2 text-gray-400 hover:text-agri-dark transition-colors">
                            <Menu size={20} />
                        </button>

                        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-64 border border-transparent focus-within:border-agri-green/50 focus-within:bg-white transition-all">
                            <Search size={16} className="text-gray-400 mr-2" />
                            <input type="text" placeholder={t('layout.search')} className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 text-gray-700" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <button className="p-2 text-gray-400 hover:text-agri-dark hover:bg-gray-100 rounded-full relative transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                        <div className="flex items-center gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900 leading-none mb-0.5">{user?.user_metadata?.full_name || t('layout.farmer')}</p>
                                <p className="text-xs text-gray-500 leading-none">{t('layout.proPlan')}</p>
                            </div>
                            <div className="w-8 h-8 bg-agri-green text-white rounded-md flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">
                                {user?.user_metadata?.full_name?.charAt(0) || 'F'}
                            </div>
                            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>

            <AnimatePresence>
                {voiceListening && (
                    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-agri-green to-emerald-500 animate-[loading_1s_ease-in-out_infinite]"></div>
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Mic size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('voice.listening')}</h3>
                            <p className="text-sm text-gray-500 mb-6">{t('voice.hint')}</p>
                            <button onClick={() => setVoiceListening(false)} className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors text-sm">{t('voice.cancel')}</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AI Chatbot - Floating Assistant */}
            <AIChatbot />
        </div>
    );
}
