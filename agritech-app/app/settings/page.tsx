'use client';

import { useState, useEffect } from 'react';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, Bell, Shield, Globe, Save, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';


export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const { user, updateProfile, signOut } = useAuth();

    // State for form fields
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        region: 'Maharashtra'
    });

    const [notifications, setNotifications] = useState({
        disease: true,
        weather: true,
        irrigation: true,
        harvest: false,
    });

    const [loading, setLoading] = useState(false);

    // Sync state with user data on load
    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.user_metadata?.full_name || '',
                phone: user.user_metadata?.phone || '',
                email: user.email || '',
                region: user.user_metadata?.region || 'Maharashtra'
            });

            if (user.user_metadata?.notifications) {
                setNotifications(user.user_metadata.notifications);
            }
        }
    }, [user]);

    // Handlers
    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            // Update profile via AuthContext to ensure global sync (Sidebar fix)
            const { error } = await updateProfile({
                full_name: formData.full_name,
                phone: formData.phone,
                region: formData.region,
                // persist notification state too
                notifications: notifications
            });

            if (error) throw error;
            alert(t('common.save') + " Success!");
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(err);
            // Friendly fallback message since Optimistic Update worked
            alert(`✅ Profile updated locally. (Note: Cloud sync failed: ${err.message || "Permissions"})`);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationToggle = (key: string) => {
        const newState = { ...notifications, [key]: !notifications[key as keyof typeof notifications] };
        setNotifications(newState);
        // Persist immediately? Or wait for Save? Prompt said "Persist". 
        // We'll auto-save for better UX
        updateProfile({ notifications: newState });
    };

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
        // Persist to profile
        updateProfile({ language: lang });
    };

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <FarmerDashboardLayout>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">{t('nav.settings')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Navigation/Profile Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-gray-500 border border-gray-200">
                            {formData.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{formData.full_name || 'User'}</h2>
                        <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
                        <span className="px-3 py-1 bg-agri-green/10 text-agri-green rounded-full text-xs font-bold uppercase">{t('layout.proPlan')}</span>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {[
                            { icon: UserIcon, label: t('settings.profile'), active: true },
                            { icon: Bell, label: t('settings.notifications'), active: false },
                            { icon: Shield, label: t('settings.security'), active: false },
                            { icon: Globe, label: t('settings.language'), active: false },
                        ].map((item, i) => (
                            <button key={i} className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${item.active ? 'bg-gray-50 text-agri-green border-l-4 border-agri-green' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                                }`}>
                                <item.icon size={18} /> {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column: Settings Content */}
                <div className="lg:col-span-2 space-y-6">

                    {/* General Profile */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <UserIcon size={20} className="text-gray-400" /> {t('settings.personalInfo')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t('auth.fullName')}</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t('settings.phone')}</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t('auth.email')}</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-500 bg-gray-50 cursor-not-allowed focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t('settings.region')}</label>
                                <select
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all bg-white"
                                >
                                    <option>Maharashtra</option>
                                    <option>Punjab</option>
                                    <option>Uttar Pradesh</option>
                                    <option>Karnataka</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveProfile}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium text-sm shadow-sm disabled:opacity-50"
                            >
                                <Save size={18} /> {loading ? t('auth.processing') : t('settings.saveChanges')}
                            </button>
                        </div>
                    </div>

                    {/* Language */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Globe size={20} className="text-gray-400" /> {t('settings.language')}
                        </h3>
                        <div className="flex gap-4">
                            {['en', 'hi', 'mr'].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang)}
                                    className={`flex-1 py-3 px-4 rounded-xl border font-bold uppercase text-sm transition-all ${i18n.language === lang
                                        ? 'bg-agri-green text-white border-agri-green shadow-md'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Bell size={20} className="text-gray-400" /> {t('settings.notifications')}
                        </h3>
                        <div className="space-y-4">
                            {[
                                { key: 'disease', label: t('settings.diseaseAlerts'), desc: t('settings.desc.disease') },
                                { key: 'weather', label: t('settings.weatherUpdates'), desc: t('settings.desc.weather') },
                                { key: 'irrigation', label: t('settings.irrigationReminders'), desc: t('settings.desc.irrigation') },
                            ].map((item: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                <div key={item.key} className="flex justify-between items-center py-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{item.label}</p>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => handleNotificationToggle(item.key)}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${notifications[item.key as keyof typeof notifications] ? 'bg-agri-green' : 'bg-gray-200'}`}
                                    >
                                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0'}`}></span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-red-600 mb-6 flex items-center gap-2">
                            <Shield size={20} /> {t('settings.dataPrivacy')}
                        </h3>
                        <div className="flex gap-4">
                            <button
                                onClick={() => alert("Contact support to delete account.")}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                            >
                                <Trash2 size={16} /> {t('settings.deleteAccount')}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                            >
                                <LogOut size={16} /> {t('settings.logoutEverywhere')}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </FarmerDashboardLayout>
    );
}
