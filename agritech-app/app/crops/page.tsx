'use client';

import { motion } from 'framer-motion';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Filter, MoreHorizontal, Sprout, MapPin, Calendar, X, Save, Droplets, Thermometer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function MyCropsPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [filter, setFilter] = useState('all');
    const [isId, setIsId] = useState<number | null>(null); // For Read More expansion
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Initial static data (would be fetched in real app)
    const [crops, setCrops] = useState([
        { id: 1, name: 'wheat', variety: 'HD-2967', health: 'healthy', area: '2 acres', stage: 'vegetative', icon: '🌾', progress: 65, planted: '12 Oct 2025' },
        { id: 2, name: 'rice', variety: 'Basmati', health: 'healthy', area: '1.5 acres', stage: 'flowering', icon: '🌾', progress: 80, planted: '15 Nov 2025' },
        { id: 3, name: 'sugarcane', variety: 'Co-86032', health: 'critical', area: '3 acres', stage: 'vegetative', icon: '🎋', progress: 45, planted: '01 Jan 2026' },
        { id: 4, name: 'cotton', variety: 'Bt Cotton', health: 'healthy', area: '2.5 acres', stage: 'flowering', icon: '🌸', progress: 70, planted: '20 Dec 2025' },
    ]);

    const [newCrop, setNewCrop] = useState({
        name: 'Wheat',
        variety: '',
        area: '',
        planted: '',
        location: '',
        soilType: 'Black Soil',
        irrigationType: 'Rainfed',
        previousCrop: '',
        seedType: 'Hybrid',
        notes: ''
    });

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
                location: newCrop.location,
                soil_type: newCrop.soilType,
                irrigation_type: newCrop.irrigationType,
                previous_crop: newCrop.previousCrop,
                seed_type: newCrop.seedType,
                notes: newCrop.notes,
                health: 'healthy',
                stage: 'vegetative',
                progress: 10,
                created_at: new Date().toISOString()
            };

            // Try saving to DB (Fail gracefully if table missing in demo)
            await supabase.from('crops').insert(cropData);

            // Optimistic update
            const nextId = Math.max(0, ...crops.map(c => c.id)) + 1;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setCrops(prev => [{ ...cropData, id: nextId, icon: '🌱', planted: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) } as any, ...prev]);

            setShowModal(false);
            setNewCrop({
                name: 'Wheat', variety: '', area: '', planted: '',
                location: '', soilType: 'Black Soil', irrigationType: 'Rainfed',
                previousCrop: '', seedType: 'Hybrid', notes: ''
            });
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
                            onClick={() => router.push(`/crops/${crop.id}`)}
                            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer"
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
                    <button onClick={() => setShowModal(true)} className="text-sm font-semibold text-agri-green border border-agri-green px-4 py-2 rounded-lg hover:bg-agri-green hover:text-white transition-colors">
                        {t('crop.addNew')}
                    </button>
                </div>
            )}

            {/* Add Crop Modal */}
            <AnimatePresence>
                {showModal && (
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Sprout className="text-agri-green" size={24} />
                                    Add New Crop
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-full">
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Basic Details */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100/60">Basic Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Crop Name</label>
                                            <select
                                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all outline-none"
                                                value={newCrop.name}
                                                onChange={e => setNewCrop({ ...newCrop, name: e.target.value })}
                                            >
                                                {['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize'].map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Variety</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all outline-none"
                                                placeholder="e.g. HD-2967"
                                                value={newCrop.variety}
                                                onChange={e => setNewCrop({ ...newCrop, variety: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Area (Acres)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all outline-none"
                                                placeholder="e.g. 2.5"
                                                value={newCrop.area}
                                                onChange={e => setNewCrop({ ...newCrop, area: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Planted Date</label>
                                            <input
                                                type="date"
                                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all outline-none"
                                                value={newCrop.planted}
                                                onChange={e => setNewCrop({ ...newCrop, planted: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Farm Details */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100/60">Farm Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex justify-between">
                                                <span>Farm Location</span>
                                                <button
                                                    onClick={() => {
                                                        if (navigator.geolocation) {
                                                            navigator.geolocation.getCurrentPosition(
                                                                (pos) => setNewCrop({ ...newCrop, location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }),
                                                                () => alert("Location permission denied.")
                                                            );
                                                        }
                                                    }}
                                                    className="text-agri-green hover:underline flex items-center gap-1"
                                                >
                                                    <MapPin size={12} /> Auto-detect
                                                </button>
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all outline-none"
                                                placeholder="Village / District or GPS Coordinates"
                                                value={newCrop.location}
                                                onChange={e => setNewCrop({ ...newCrop, location: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Soil Type</label>
                                            <select
                                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all outline-none"
                                                value={newCrop.soilType}
                                                onChange={e => setNewCrop({ ...newCrop, soilType: e.target.value })}
                                            >
                                                {['Black Soil', 'Red Soil', 'Alluvial Soil', 'Sandy Soil', 'Clay Soil'].map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Irrigation Type</label>
                                            <select
                                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all outline-none"
                                                value={newCrop.irrigationType}
                                                onChange={e => setNewCrop({ ...newCrop, irrigationType: e.target.value })}
                                            >
                                                {['Rainfed', 'Drip Irrigation', 'Sprinkler', 'Canal Irrigation', 'Borewell'].map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Previous Crop</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all outline-none"
                                                placeholder="e.g. Soybean"
                                                value={newCrop.previousCrop}
                                                onChange={e => setNewCrop({ ...newCrop, previousCrop: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Seed Type</label>
                                            <select
                                                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all outline-none"
                                                value={newCrop.seedType}
                                                onChange={e => setNewCrop({ ...newCrop, seedType: e.target.value })}
                                            >
                                                {['Hybrid', 'Certified', 'Local'].map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Optional Fields */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100/60">Optional</h4>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Notes / Remarks</label>
                                        <textarea
                                            rows={3}
                                            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50/50 focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all outline-none resize-none"
                                            placeholder="Add any extra notes here..."
                                            value={newCrop.notes}
                                            onChange={e => setNewCrop({ ...newCrop, notes: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-white flex gap-3 sticky bottom-0 z-10">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-700 font-bold hover:bg-gray-100 bg-gray-50 border border-gray-200 rounded-xl transition-colors shadow-sm">
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleAddCrop}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-agri-green text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
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
