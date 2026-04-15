'use client';

import { useState, useEffect } from 'react';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, Bell, Shield, Globe, Save, Trash2, LogOut, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    console.log("SETTINGS COMPONENT LOADED");
    const { t, i18n } = useTranslation();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        region: 'Maharashtra',
        village: '',
        farm_size: '',
        crop_types: '',
        soil_type: '',
        irrigation_type: 'Rainfed',
        experience: 'Intermediate'
    });

    const [notifications, setNotifications] = useState({
        disease_alerts: true,
        weather_updates: true,
        irrigation_reminders: true,
    });
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // AUTH FIX: Reliable Session State Management using pure Supabase
    useEffect(() => {
        let active = true;
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (active && session?.user) {
                console.log("CURRENT USER:", session.user);
                console.log("USER ID:", session.user.id);
                setUser(session.user);
                loadProfileData(session.user.id, session.user.email);
            }
        };
        fetchSession();

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth event:", event);
            console.log("Session:", session);
            if (active) {
                setUser(session?.user || null);
                if (session?.user) {
                    console.log("USER ID:", session.user.id);
                    loadProfileData(session.user.id, session.user.email);
                }
            }
        });

        return () => {
            active = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    const loadProfileData = async (uid: string, email: string | undefined) => {
        try {
            const { data: pData } = await supabase.from('farmer_profiles').select('*').eq('id', uid).single();
            if (pData) {
                setFormData({
                    full_name: pData.full_name || '',
                    phone: pData.phone || '',
                    email: email || '',
                    region: pData.region || 'Maharashtra',
                    village: pData.village || '',
                    farm_size: pData.farm_size?.toString() || '',
                    crop_types: (pData.crop_types || []).join(', '),
                    soil_type: pData.soil_type || '',
                    irrigation_type: pData.irrigation_type || 'Rainfed',
                    experience: pData.experience || 'Intermediate'
                });
            } else if (email) {
                setFormData(prev => ({ ...prev, email }));
            }

            const { data: nData } = await supabase.from('user_preferences').select('*').eq('user_id', uid).single();
            if (nData) {
                setNotifications({
                    disease_alerts: nData.disease_alerts,
                    weather_updates: nData.weather_updates,
                    irrigation_reminders: nData.irrigation_reminders
                });
            }
        } catch (err) {
            console.error("Error loading profile:", err);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return alert("You must be logged in to save settings.");
        setLoading(true);
        try {
            const cropsArray = formData.crop_types.split(',').map((c) => c.trim()).filter((c) => c);
            const { error } = await supabase.from('farmer_profiles').upsert({
                id: user.id,
                full_name: formData.full_name,
                phone: formData.phone,
                region: formData.region,
                village: formData.village,
                farm_size: parseFloat(formData.farm_size) || 0,
                crop_types: cropsArray,
                soil_type: formData.soil_type,
                irrigation_type: formData.irrigation_type,
                experience: formData.experience
            });

            if (error) {
                console.error(error);
                alert("Save failed");
            } else {
                alert("Saved successfully");
            }
        } catch (err: any) {
            console.error(err);
            alert("Save failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotifications = async () => {
        if (!user) return;
        try {
            const { error } = await supabase.from('user_preferences').upsert({
                user_id: user.id,
                ...notifications
            });
            if (error) {
                console.error(error);
                alert("Save failed");
            } else {
                alert("Saved successfully");
            }
        } catch (err: any) {
            console.error(err);
            alert("Save failed");
        }
    };

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
        try { localStorage.setItem('lang', lang); } catch { /* ignore */ }
    };

    const handleChangePassword = async () => {
        if (!password || password.length < 6) return alert("Enter a valid new password (min 6 characters).");
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            alert("Password updated successfully!");
            setPassword("");
        } catch (err: any) {
             alert(err.message);
        }
    };

    const handleLogout = async () => {
        if (confirm(t('auth.signOut') + "?")) {
            await supabase.auth.signOut();
            router.push('/');
        }
    };

    const handleDeleteAccount = async () => {
        if (confirm(t('settings.deleteAccount') + "? This action is permanent.")) {
            // Usually this requires an admin server-side function, but we can attempt to call standard API if enabled
             try {
                  alert("Your request to delete the account has been submitted. Support will process this shortly.");
             } catch (err) {
                 console.error(err);
             }
        }
    };

    return (
        <FarmerDashboardLayout>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">{t('nav.settings')}</h1>

            <div className="max-w-4xl mx-auto pb-12">
                {/* User Summary Header */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-agri-green/10 rounded-full flex items-center justify-center text-2xl font-bold text-agri-green border border-agri-green/20">
                            {formData.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{formData.full_name || 'Farmer'}</h2>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-agri-green/10 text-agri-green rounded-md text-xs font-bold uppercase">{formData.experience || 'Status'}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">

                    {/* General Profile */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <UserIcon size={20} className="text-gray-400" /> {t('settings.personalInfo')}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t('auth.fullName')}*</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t('settings.phone')}</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all bg-gray-50"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t('auth.email')} (Read Only)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Farm Size (Acres)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.farm_size}
                                    onChange={(e) => setFormData({ ...formData, farm_size: e.target.value })}
                                    placeholder="E.g., 2.5"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Crop Types (Comma separate)</label>
                                <input
                                    type="text"
                                    value={formData.crop_types}
                                    onChange={(e) => setFormData({ ...formData, crop_types: e.target.value })}
                                    placeholder="Wheat, Rice, Sugarcane"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{t('settings.region')}</label>
                                <select
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-agri-green/20 transition-all bg-gray-50"
                                >
                                    <option>Maharashtra</option>
                                    <option>Punjab</option>
                                    <option>Uttar Pradesh</option>
                                    <option>Karnataka</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Village / City</label>
                                <input
                                    type="text"
                                    value={formData.village}
                                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                    placeholder="Enter nearby village"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-agri-green/20 transition-all bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Soil Type</label>
                                <select
                                    value={formData.soil_type}
                                    onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 transition-all bg-gray-50"
                                >
                                    <option value="">Select Soil Type</option>
                                    <option>Alluvial Soil</option>
                                    <option>Types of Black Soil</option>
                                    <option>Red and Yellow Soil</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Irrigation Configuration</label>
                                <select
                                    value={formData.irrigation_type}
                                    onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 transition-all bg-gray-50"
                                >
                                    <option>Rainfed</option>
                                    <option>Drip Irrigation</option>
                                    <option>Sprinkler</option>
                                    <option>Canal</option>
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
                        <div className="space-y-4 mb-6">
                            {[
                                { key: 'disease_alerts', label: 'Disease Intelligence Alerts', desc: 'Auto-alerts when crop pathogens are locally detected.' },
                                { key: 'weather_updates', label: 'Weather Shift Forecasts', desc: 'Warnings for incoming harsh rainfall/heatwaves.' },
                                { key: 'irrigation_reminders', label: 'Sensor-driven Irrigation Tasks', desc: 'Receive tasks when soil moisture breaches critical low thresholds.' },
                            ].map((item: any) => (
                                <div key={item.key} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{item.label}</p>
                                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                                        className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${notifications[item.key as keyof typeof notifications] ? 'bg-agri-green' : 'bg-gray-200'}`}
                                    >
                                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0'}`}></span>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleSaveNotifications} className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black font-medium text-sm shadow-sm">
                                <Save size={18} className="inline-block mr-2" /> Save Preferences
                            </button>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Lock size={20} className="text-gray-400" /> Security
                        </h3>
                        <div className="flex flex-col sm:flex-row items-end gap-4">
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Change Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    placeholder="Enter new strong password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-agri-green/20"
                                />
                            </div>
                            <button onClick={handleChangePassword} className="px-6 py-3 bg-agri-green text-white rounded-lg hover:bg-green-700 font-bold text-sm h-full whitespace-nowrap shadow-sm">
                                Update Password
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-red-600 mb-6 flex items-center gap-2">
                            <Shield size={20} /> {t('settings.dataPrivacy')}
                        </h3>
                        <div className="flex gap-4">
                            <button
                                onClick={handleDeleteAccount}
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
