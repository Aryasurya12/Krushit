'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { useTranslation } from 'react-i18next';
import {
    Droplets,
    Thermometer,
    Wind,
    Beaker,
    Plus,
    Activity,
    X,
    Save,
    Calendar,
    Info,
    TrendingUp,
    ChevronRight,
    Search,
    AlertCircle,
    CheckCircle2,
    CalendarDays,
    ArrowUpRight,
    ArrowDownRight,
    Play,
    Sprout,
    Zap,
    MapPin,
    FlaskConical,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cropsApi, iotSensorsApi } from '@/lib/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// --- Sub-components ---

const MoistureChart = ({ data }: any) => {
    const chartData = {
        labels: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'],
        datasets: [
            {
                label: 'Moisture (%)',
                data: data || [45, 42, 38, 35, 32, 30, 28],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 2,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: {
            y: { min: 0, max: 100, display: false },
            x: { display: false }
        }
    };

    return (
        <div className="h-20 w-full mt-2">
            <Line data={chartData} options={chartOptions} />
        </div>
    );
};

const CropAdvisoryCard = ({ crop, index }: any) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(index === 0);

    // Dynamic advice simulation based on stage
    const isVegetative = crop.current_stage === 'vegetative';
    const moistureValue = isVegetative ? 28 : (crop.health_status === 'healthy' ? 42 : 35);
    const isMoistureLow = moistureValue < 35;
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden mb-8"
        >
            {/* Crop Header */}
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-6 md:p-8 cursor-pointer hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50"
            >
                <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${
                        crop.health_status === 'danger' ? 'bg-red-50 text-red-500' : 
                        crop.health_status === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-agri-green'
                    }`}>
                        <Sprout size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-black text-gray-900">{crop.name}</h2>
                            <span className="text-gray-300 mx-1">•</span>
                            <span className="text-sm font-bold text-gray-500">{crop.variety || 'Local'}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <MapPin size={14} /> {crop.area} Acres
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-agri-green bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                <Activity size={14} /> Stage: {crop.current_stage}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {isMoistureLow && (
                           <div className="p-2 bg-red-100 text-red-600 rounded-full border-2 border-white shadow-sm" title="Low Moisture">
                               <AlertCircle size={16} />
                           </div>
                        )}
                        {!isVegetative && (
                           <div className="p-2 bg-amber-100 text-amber-600 rounded-full border-2 border-white shadow-sm" title="Nutrient Check">
                               <FlaskConical size={16} />
                           </div>
                        )}
                    </div>
                    {isExpanded ? <ChevronUp className="text-gray-300" /> : <ChevronDown className="text-gray-300" />}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 md:p-8 space-y-10 bg-gray-50/30">
                            
                            {/* Section 1: Water Advice */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-500 text-white rounded-lg shadow-sm">
                                            <Droplets size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{t('water.fertilizer').replace('Fertilizer', 'Water')}</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-28">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('water.soilMoisture')}</span>
                                                <TrendingUp size={14} className={isMoistureLow ? "text-red-400" : "text-emerald-400"} />
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-2xl font-black ${isMoistureLow ? 'text-red-500' : 'text-gray-900'}`}>{moistureValue}%</span>
                                                <span className="text-xs font-bold text-gray-400">(Ideal 35-55%)</span>
                                            </div>
                                            <MoistureChart data={isMoistureLow ? [45, 42, 38, 35, 32, 30, 28] : [48, 52, 50, 48, 46, 44, 42]} />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{t('water.soilTemp')}</span>
                                                <div className="flex items-center gap-2">
                                                    <Thermometer size={16} className="text-amber-500" />
                                                    <span className="text-xl font-bold text-gray-900">24°C</span>
                                                </div>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{t('water.humidity')}</span>
                                                <div className="flex items-center gap-2">
                                                    <Wind size={16} className="text-blue-500" />
                                                    <span className="text-xl font-bold text-gray-900">65%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-8 bg-white/70 backdrop-blur-sm rounded-3xl border border-blue-100/50 p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
                                            <Activity size={16} /> Recommendation
                                        </div>
                                        <p className="text-xl font-bold text-gray-900 leading-tight mb-6">
                                            {isMoistureLow 
                                                ? "Soil moisture is below the optimal range. Irrigation is recommended today."
                                                : "Soil moisture is currently optimal. No irrigation needed for next 24 hours."}
                                        </p>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{t('water.waterAmount')}</p>
                                                <p className="text-lg font-black text-gray-900">{isMoistureLow ? (crop.area * 100) + ' L' : '0 L'}</p>
                                            </div>
                                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{t('water.meth')}</p>
                                                <p className="text-lg font-black text-gray-900">Drip</p>
                                            </div>
                                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{t('water.dur')}</p>
                                                <p className="text-lg font-black text-gray-900">{isMoistureLow ? '45 min' : '-'}</p>
                                            </div>
                                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{t('water.nextCheck')}</p>
                                                <p className="text-lg font-black text-gray-900">Tomorrow</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-center">
                                        <button className={`p-8 rounded-full shadow-lg transition-all active:scale-95 ${isMoistureLow ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                            <Play size={40} fill="currentColor" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Section 2: Fertilizer Advice */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-agri-green text-white rounded-lg shadow-sm">
                                            <FlaskConical size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{t('water.fertilizer')}</h3>
                                    </div>
                                    
                                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-6">{t('water.nutrient')}</span>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Nitrogen (N)', val: 42, color: 'bg-blue-500', status: 'Low' },
                                                { label: 'Phosphorus (P)', val: 68, color: 'bg-emerald-500', status: 'Optimal' },
                                                { label: 'Potassium (K)', val: 55, color: 'bg-amber-500', status: 'Good' }
                                            ].map((n, i) => (
                                                <div key={i} className="space-y-1.5">
                                                    <div className="flex justify-between text-xs font-bold">
                                                        <span className="text-gray-600">{n.label}</span>
                                                        <span className={n.status === 'Low' ? 'text-red-500' : 'text-gray-400'}>{n.status}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: n.val + '%' }}
                                                            className={`h-full ${n.color}`} 
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('water.ph')}</span>
                                            <span className="text-2xl font-black text-agri-green">6.8 <span className="text-[10px] font-bold text-agri-green/50 tracking-normal">Optimal</span></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-8 bg-white/70 backdrop-blur-sm rounded-3xl border border-green-100/50 p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-agri-green font-bold text-xs uppercase tracking-widest mb-4">
                                            <FlaskConical size={16} /> Nutrient Recommendation
                                        </div>
                                        <p className="text-xl font-bold text-gray-900 leading-tight mb-6">
                                            {isVegetative 
                                                ? "Nitrogen level is low during vegetative stage. Apply nitrogen fertilizer to support leaf growth."
                                                : "Nutrient levels are stable. Maintain current fertigation schedule."}
                                        </p>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                                <p className="text-[10px] font-bold text-agri-green uppercase mb-1">Fertilizer Type</p>
                                                <p className="text-lg font-black text-gray-900">{isVegetative ? 'Urea / NPK' : 'None'}</p>
                                            </div>
                                            <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                                <p className="text-[10px] font-bold text-agri-green uppercase mb-1">{t('water.amt')}</p>
                                                <p className="text-lg font-black text-gray-900">{isVegetative ? '40 kg/acre' : '-'}</p>
                                            </div>
                                            <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                                <p className="text-[10px] font-bold text-agri-green uppercase mb-1">{t('water.meth')}</p>
                                                <p className="text-lg font-black text-gray-900">Broadcast</p>
                                            </div>
                                            <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                                <p className="text-[10px] font-bold text-agri-green uppercase mb-1">{t('water.next')}</p>
                                                <p className="text-lg font-black text-gray-900">March 25</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-center">
                                        <button className={`p-8 rounded-full shadow-lg transition-all active:scale-95 ${isVegetative ? 'bg-agri-green hover:bg-emerald-700 text-white shadow-green-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                            <FlaskConical size={40} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// --- Main Page ---

export default function AdvicePage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [crops, setCrops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newSensor, setNewSensor] = useState({ type: 'moisture', sensorId: '' });

    useEffect(() => {
        const fetchCrops = async () => {
            // DEMO MODE: Detect demo user and use mock data immediately
            if (user?.id === 'd3300000-0000-0000-0000-000000000000') {
                setCrops([
                    { id: '1', name: 'Wheat', variety: 'HD 2967', area: 2, current_stage: 'vegetative', health_status: 'warning' },
                    { id: '2', name: 'Cotton', variety: 'BT Cotton', area: 3, current_stage: 'flowering', health_status: 'healthy' },
                    { id: '3', name: 'Rice', variety: 'Basmati', area: 1.5, current_stage: 'vegetative', health_status: 'healthy' }
                ]);
                setLoading(false);
                return;
            }

            try {
                const data = await cropsApi.getAll();
                if (data && data.length > 0) {
                    setCrops(data);
                } else {
                    // Fallback to mock if database is actually empty
                    setCrops([
                        { id: '1', name: 'Wheat', variety: 'HD 2967', area: 2, current_stage: 'vegetative', health_status: 'warning' },
                        { id: '2', name: 'Cotton', variety: 'BT Cotton', area: 3, current_stage: 'flowering', health_status: 'healthy' },
                        { id: '3', name: 'Rice', variety: 'Basmati', area: 1.5, current_stage: 'vegetative', health_status: 'healthy' }
                    ]);
                }
            } catch (err) {
                console.warn("Using offline mode data:", err);
                // Fallback to mock on any connection error
                setCrops([
                    { id: '1', name: 'Wheat', variety: 'HD 2967', area: 2, current_stage: 'vegetative', health_status: 'warning' },
                    { id: '2', name: 'Cotton', variety: 'BT Cotton', area: 3, current_stage: 'flowering', health_status: 'healthy' },
                    { id: '3', name: 'Rice', variety: 'Basmati', area: 1.5, current_stage: 'vegetative', health_status: 'healthy' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchCrops();
    }, [user]);

    return (
        <FarmerDashboardLayout>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-agri-green font-bold text-sm uppercase tracking-widest mb-1">
                        <Activity size={16} />
                        Advisory Dashboard
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('water.title')}</h1>
                    <p className="text-gray-500 font-medium text-lg">{t('water.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-xl shadow-gray-200 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        {t('water.addSensor')}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-agri-green border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 font-bold animate-pulse">Analyzing Farm Data...</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {crops.map((crop, idx) => (
                        <CropAdvisoryCard key={crop.id} crop={crop} index={idx} />
                    ))}
                </div>
            )}

            {/* Add Sensor Modal (Legacy but functional) */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">Add New Sensor</h3>
                                    <p className="text-xs text-gray-500 font-medium">Link your IoT device</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:shadow-sm transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Sensor Type</label>
                                    <select
                                        className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 text-gray-700 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        value={newSensor.type}
                                        onChange={e => setNewSensor({ ...newSensor, type: e.target.value })}
                                    >
                                        <option value="moisture">Soil Moisture</option>
                                        <option value="temp">Soil Temperature</option>
                                        <option value="humidity">Air Humidity</option>
                                        <option value="ph">Soil pH</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Device ID / Serial</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-12 p-4 border border-gray-100 rounded-2xl bg-gray-50 text-gray-700 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-gray-300"
                                            placeholder="e.g. SN-2026-X5"
                                            value={newSensor.sensorId}
                                            onChange={e => setNewSensor({ ...newSensor, sensorId: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex gap-4">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-white hover:shadow-sm rounded-2xl transition-all">
                                    Cancel
                                </button>
                                <button
                                    onClick={() => { alert("Sensor Liked!"); setShowModal(false); }}
                                    className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <Save size={18} /> Save
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </FarmerDashboardLayout>
    );
}
