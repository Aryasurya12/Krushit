'use client';

import { motion } from 'framer-motion';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Filter, MoreHorizontal, Sprout, MapPin, Calendar, X, Save, Droplets, Thermometer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AnimatePresence } from 'framer-motion';

export default function MyCropsPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [filter, setFilter] = useState('all');
    const [isId, setIsId] = useState<number | null>(null); // For Read More expansion
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial static data (would be fetched in real app)
    const [crops, setCrops] = useState([
        { id: 1, name: 'wheat', variety: 'HD-2967', health: 'healthy', area: '2 acres', stage: 'vegetative', icon: '🌾', progress: 65, planted: '12 Oct 2025' },
        { id: 2, name: 'rice', variety: 'Basmati', health: 'healthy', area: '1.5 acres', stage: 'flowering', icon: '🌾', progress: 80, planted: '15 Nov 2025' },
        { id: 3, name: 'sugarcane', variety: 'Co-86032', health: 'critical', area: '3 acres', stage: 'vegetative', icon: '🎋', progress: 45, planted: '01 Jan 2026' },
        { id: 4, name: 'cotton', variety: 'Bt Cotton', health: 'healthy', area: '2.5 acres', stage: 'flowering', icon: '🌸', progress: 70, planted: '20 Dec 2025' },
    ]);

    const [newCrop, setNewCrop] = useState({ name: 'Wheat', variety: '', area: '', planted: '' });

    const filteredCrops = filter === 'all' ? crops : crops.filter(c => c.health === filter);

    const handleAddCrop = async () => {
        if (!newCrop.variety || !newCrop.area) return alert(t('common.fillAll'));
        setLoading(true);

        try {
            const cropData = {
                user_id: user?.id,
                name: newCrop.name.toLowerCase(),
                variety: newCrop.variety,
                area: newCrop.area,
                planted_date: newCrop.planted,
                health: 'healthy',
                stage: 'vegetative',
                progress: 10
            };

            // Try saving to DB (Fail gracefully if table missing in demo)
            await supabase.from('crops').insert(cropData);

            // Optimistic update
            const nextId = Math.max(...crops.map(c => c.id)) + 1;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setCrops(prev => [{ ...cropData, id: nextId, icon: '🌱', planted: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) } as any, ...prev]);

            setShowModal(false);
            setNewCrop({ name: 'Wheat', variety: '', area: '', planted: '' });
            alert("✅ Crop added successfully!");

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleReadMore = (id: number) => {
        setIsId(isId === id ? null : id);
    };

    return (
        <FarmerDashboardLayout>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('nav.myCrop')}</h1>
                    <p className="text-sm text-gray-500">{t('dashboard.subtitle')}</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-agri-green hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors"
                >
                    <Plus size={18} />
                    {t('crop.addNew')}
                </button>
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    {['all', 'healthy', 'critical'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap capitalize ${filter === f
                                ? 'bg-gray-900 text-white shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {f === 'all' ? t('crop.all') : t(`crop_data.${f}`)}
                        </button>
                    ))}
                </div>
                <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    <Filter size={16} /> {t('common.filter')}
                </button>
            </div>

            {/* Crops Grid */}
            {filteredCrops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCrops.map((crop) => (
                        <motion.div
                            key={crop.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                        >
                            {/* Card Header image placeholder or color strip */}
                            <div className="h-2 bg-gradient-to-r from-agri-green to-emerald-400"></div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-2xl border border-green-100">
                                            {crop.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{t(`crop_data.${crop.name}`)}</h3>
                                            <p className="text-xs text-gray-500 font-medium">{crop.variety}</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <MapPin size={14} className="text-gray-400" />
                                        <span>{crop.area}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span>{crop.planted}</span>
                                    </div>
                                </div>

                                {/* Health Status & Stage */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-gray-500 uppercase tracking-wide">{t('dashboard.stat.currentStage')}</span>
                                        <span className="text-agri-green">{t(`dashboard.stat.${crop.stage}`)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-agri-green h-2 rounded-full transition-all duration-1000"
                                            style={{ width: `${crop.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${crop.health === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {t(`crop_data.${crop.health}`)}
                                    </span>
                                    <button
                                        onClick={() => toggleReadMore(crop.id)}
                                        className="text-sm font-semibold text-agri-green hover:underline"
                                    >
                                        {isId === crop.id ? t('common.showLess') : t('dashboard.readMore')}
                                    </button>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isId === crop.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                        <Droplets size={14} />
                                                        <span className="text-xs font-bold uppercase">Moisture</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-blue-900">45%</p>
                                                </div>
                                                <div className="bg-amber-50 p-3 rounded-lg">
                                                    <div className="flex items-center gap-2 text-amber-600 mb-1">
                                                        <Thermometer size={14} />
                                                        <span className="text-xs font-bold uppercase">Temp</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-amber-900">28°C</p>
                                                </div>
                                                <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-xs text-gray-500 mb-1">Next Action</p>
                                                    <p className="text-sm font-medium text-gray-900">Apply Fertilizer (N-P-K) in 2 days.</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Sprout size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t('crop.noCrops')}</h3>
                    <p className="text-sm text-gray-500 mb-6">{t('crop.addFirst')}</p>
                    <button className="text-sm font-semibold text-agri-green border border-agri-green px-4 py-2 rounded-lg hover:bg-agri-green hover:text-white transition-colors">
                        {t('crop.addNew')}
                    </button>
                </div>
            )}

            {/* Add Crop Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900">{t('crop.addNew')}</h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('crop_data.wheat')} / Name</label>
                                    <select
                                        className="w-full p-3 border rounded-lg bg-white"
                                        value={newCrop.name}
                                        onChange={e => setNewCrop({ ...newCrop, name: e.target.value })}
                                    >
                                        {['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize', 'Tomato'].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Variety</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-lg"
                                        placeholder="e.g. HD-2967"
                                        value={newCrop.variety}
                                        onChange={e => setNewCrop({ ...newCrop, variety: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Area (Acres)</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-lg"
                                        placeholder="e.g. 2.5 acres"
                                        value={newCrop.area}
                                        onChange={e => setNewCrop({ ...newCrop, area: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Planted Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 border rounded-lg"
                                        value={newCrop.planted}
                                        onChange={e => setNewCrop({ ...newCrop, planted: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-600 font-semibold hover:bg-gray-200 rounded-lg transition-colors">
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleAddCrop}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-agri-green text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Saving...' : <><Save size={18} /> {t('common.save')}</>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </FarmerDashboardLayout>
    );
}
