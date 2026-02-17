'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { useTranslation } from 'react-i18next';
import { Droplets, Thermometer, Wind, Beaker, Plus, Activity, X, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SensorCard = ({ title, value, unit, icon: Icon, status, change }: any) => {
    // Determine color based on status
    const statusColor = status === 'ok' ? 'text-green-500 bg-green-50' : status === 'warning' ? 'text-amber-500 bg-amber-50' : 'text-red-500 bg-red-50';
    const borderColor = status === 'ok' ? 'border-gray-200' : status === 'warning' ? 'border-amber-200' : 'border-red-200';

    return (
        <div className={`bg-white p-5 rounded-xl border ${borderColor} shadow-sm relative overflow-hidden group hover:shadow-md transition-all`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${statusColor}`}>
                    <Icon size={20} />
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${statusColor}`}>
                    {status}
                </span>
            </div>
            <div className="mb-1">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h4>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">{value}</span>
                    <span className="text-sm font-medium text-gray-400">{unit}</span>
                </div>
            </div>
            {change && (
                <div className="text-xs font-medium text-gray-400 mt-2">
                    {change > 0 ? '↑' : '↓'} {Math.abs(change)}% vs last hour
                </div>
            )}
        </div>
    );
};

export default function WaterAdvicePage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial sensors state (merged with user's saved sensors in real app)
    const [sensors, setSensors] = useState([
        { id: 's1', title: 'iot.soilMoisture', value: '28', unit: '%', icon: Droplets, status: 'warning', change: -5, type: 'moisture' },
        { id: 's2', title: 'iot.soilTemperature', value: '24', unit: '°C', icon: Thermometer, status: 'ok', change: 2, type: 'temp' },
        { id: 's3', title: 'iot.airHumidity', value: '65', unit: '%', icon: Wind, status: 'ok', change: 0, type: 'humidity' },
        { id: 's4', title: 'iot.soilPH', value: '6.5', unit: 'pH', icon: Beaker, status: 'ok', change: 0, type: 'ph' }
    ]);

    const [newSensor, setNewSensor] = useState({ type: 'moisture', sensorId: '' });

    const handleAddSensor = async () => {
        if (!newSensor.sensorId) return alert("Please enter a Sensor ID");
        setLoading(true);

        try {
            // Create new sensor object
            const sensorObj = {
                id: newSensor.sensorId,
                title: newSensor.type === 'moisture' ? 'iot.soilMoisture' :
                    newSensor.type === 'temp' ? 'iot.soilTemperature' :
                        newSensor.type === 'humidity' ? 'iot.airHumidity' : 'iot.soilPH',
                value: '--', // Initial value
                unit: newSensor.type === 'moisture' || newSensor.type === 'humidity' ? '%' :
                    newSensor.type === 'temp' ? '°C' : 'pH',
                icon: newSensor.type === 'moisture' ? Droplets :
                    newSensor.type === 'temp' ? Thermometer :
                        newSensor.type === 'humidity' ? Wind : Beaker,
                status: 'ok',
                change: 0,
                type: newSensor.type
            };

            // Save to User Profile (Metadata)
            const currentSensors = user?.user_metadata?.sensors || [];
            const updatedSensors = [...currentSensors, { id: newSensor.sensorId, type: newSensor.type }];

            await supabase.auth.updateUser({
                data: { sensors: updatedSensors }
            });

            // Update UI
            setSensors(prev => [...prev, sensorObj]);
            setShowModal(false);
            setNewSensor({ type: 'moisture', sensorId: '' });
            alert("✅ Sensor added!");

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <FarmerDashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('nav.waterAdvice')}</h1>
                    <p className="text-sm text-gray-500">{t('water.subtitle')}</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors"
                >
                    <Plus size={18} />
                    {t('water.addSensor')}
                </button>
            </div>

            {/* Smart Recommendation Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Insight */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Droplets size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                <Activity size={20} className="text-white" />
                            </span>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-100">{t('water.liveRec')}</h2>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                            {t('messages.soilDryTemp')}
                        </h3>

                        <div className="flex flex-wrap gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 min-w-[140px]">
                                <p className="text-xs text-blue-200 mb-1 font-medium">{t('water.waterAmount')}</p>
                                <p className="text-2xl font-bold">500 L</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 min-w-[140px]">
                                <p className="text-xs text-blue-200 mb-1 font-medium">{t('water.nextCheck')}</p>
                                <p className="text-2xl font-bold">2 {t('crop_data.days')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Score */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-center items-center text-center">
                    <div className="w-32 h-32 rounded-full border-8 border-blue-100 flex items-center justify-center mb-4 relative">
                        <div className="absolute inset-0 border-8 border-blue-500 rounded-full border-t-transparent animate-[spin_3s_linear_infinite]" style={{ transform: 'rotate(45deg)' }}></div>
                        <div className="text-center">
                            <span className="text-3xl font-bold text-gray-900 block">85</span>
                            <span className="text-xs text-gray-500 font-bold uppercase">{t('recommendations.healthScore')}</span>
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t('water.efficient')}</h3>
                    <p className="text-sm text-gray-500">{t('water.optimal')}</p>
                </div>
            </div>

            {/* Sensor Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {sensors.map((sensor, idx) => (
                    <SensorCard
                        key={idx}
                        title={t(sensor.title)}
                        value={sensor.value}
                        unit={sensor.unit}
                        icon={sensor.icon}
                        status={sensor.status}
                        change={sensor.change}
                    />
                ))}
            </div>

            {/* Add Sensor Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900">{t('water.addSensor')}</h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sensor Type</label>
                                    <select
                                        className="w-full p-3 border rounded-lg bg-white"
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
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Device ID / Serial</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-lg"
                                        placeholder="e.g. SN-2026-X5"
                                        value={newSensor.sensorId}
                                        onChange={e => setNewSensor({ ...newSensor, sensorId: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="p-5 border-t border-gray-100 flex gap-3">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors">
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleAddSensor}
                                    disabled={loading}
                                    className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
