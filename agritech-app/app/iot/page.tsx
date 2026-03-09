'use client';

import { useState } from 'react';
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
    CloudRain,
    Zap,
    TrendingUp,
    ChevronRight,
    Search,
    AlertCircle,
    CheckCircle2,
    CalendarDays,
    ArrowUpRight,
    ArrowDownRight,
    Play
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
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

// --- Components ---

const SensorCard = ({ title, value, unit, icon: Icon, status, idealRange, trend }: any) => {
    const getStatusStyles = () => {
        switch (status.toLowerCase()) {
            case 'optimal':
            case 'good':
                return {
                    bg: 'bg-emerald-50',
                    text: 'text-emerald-600',
                    border: 'border-emerald-100',
                    dot: 'bg-emerald-500'
                };
            case 'low':
            case 'high':
            case 'warning':
                return {
                    bg: 'bg-amber-50',
                    text: 'text-amber-600',
                    border: 'border-amber-100',
                    dot: 'bg-amber-500'
                };
            default:
                return {
                    bg: 'bg-red-50',
                    text: 'text-red-600',
                    border: 'border-red-100',
                    dot: 'bg-red-500'
                };
        }
    };

    const styles = getStatusStyles();

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${styles.bg} ${styles.text} transition-colors`}>
                    <Icon size={20} />
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.bg} ${styles.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
                    {status}
                </div>
            </div>

            <div className="space-y-1">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h4>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-gray-900 leading-tight">{value}</span>
                    <span className="text-sm font-bold text-gray-400">{unit}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Ideal Range</span>
                    <span className="text-gray-700 font-bold">{idealRange}</span>
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[11px] font-bold">
                        {trend > 0 ? (
                            <span className="text-emerald-500 flex items-center">
                                <ArrowUpRight size={12} className="mr-0.5" /> {Math.abs(trend)}%
                            </span>
                        ) : (
                            <span className="text-amber-500 flex items-center">
                                <ArrowDownRight size={12} className="mr-0.5" /> {Math.abs(trend)}%
                            </span>
                        )}
                        <span className="text-gray-400 font-medium ml-1">vs last check</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Page ---

export default function WaterAdvicePage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [autoMode, setAutoMode] = useState(true);
    const [loading, setLoading] = useState(false);

    // Initial sensors state
    const sensors = [
        { id: 's1', title: 'Soil Moisture', value: '28', unit: '%', icon: Droplets, status: 'Low', idealRange: '35% – 55%', trend: -5 },
        { id: 's2', title: 'Soil Temperature', value: '24', unit: '°C', icon: Thermometer, status: 'Optimal', idealRange: '18°C – 25°C', trend: 2 },
        { id: 's3', title: 'Air Humidity', value: '65', unit: '%', icon: Wind, status: 'Good', idealRange: '50% – 70%', trend: 0 },
        { id: 's4', title: 'Soil pH', value: '6.5', unit: 'pH', icon: Beaker, status: 'Optimal', idealRange: '6.0 – 7.0', trend: 0 }
    ];

    const [newSensor, setNewSensor] = useState({ type: 'moisture', sensorId: '' });

    // Chart Data for Soil Moisture Trend
    const chartData = {
        labels: ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '11 PM'],
        datasets: [
            {
                label: 'Soil Moisture (%)',
                data: [45, 42, 38, 32, 28, 48, 46], // Simulated: dips during day, spikes after irrigation
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
            {
                label: 'Ideal Min',
                data: [35, 35, 35, 35, 35, 35, 35],
                borderColor: 'rgba(16, 185, 129, 0.3)',
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 },
                cornerRadius: 8,
                displayColors: false,
            }
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                grid: {
                    color: 'rgba(0, 0, 0, 0.03)',
                },
                ticks: {
                    font: { size: 11, weight: '500' },
                    color: '#94a3b8',
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: { size: 11, weight: '500' },
                    color: '#94a3b8',
                }
            }
        }
    };

    const handleAddSensor = async () => {
        if (!newSensor.sensorId) return alert("Please enter a Sensor ID");
        setLoading(true);
        try {
            const currentSensors = user?.user_metadata?.sensors || [];
            const updatedSensors = [...currentSensors, { id: newSensor.sensorId, type: newSensor.type }];
            await supabase.auth.updateUser({ data: { sensors: updatedSensors } });
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
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-agri-green font-bold text-sm uppercase tracking-widest mb-1">
                        <Droplets size={16} />
                        Control Center
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Water Advice</h1>
                    <p className="text-gray-500 font-medium">Smart irrigation analytics and IoT monitoring</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white border border-gray-200 rounded-xl p-1.5 flex items-center shadow-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5">
                            <Zap size={16} className={autoMode ? "text-amber-500 fill-amber-500" : "text-gray-300"} />
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Auto Mode</span>
                        </div>
                        <button
                            onClick={() => setAutoMode(!autoMode)}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${autoMode ? 'bg-agri-green' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${autoMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-gray-200 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Add Sensor
                    </button>
                </div>
            </div>

            {/* Top Insight Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* 1. AI Irrigation Recommendation */}
                <div className="lg:col-span-2 bg-[#2563eb] rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
                    {/* Background Decorative Rings */}
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-400/20 rounded-full blur-2xl" />

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <Activity size={18} className="text-blue-100" />
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-50">AI Irrigation Status</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest leading-none mb-1">Last Sync</p>
                                <p className="text-xs font-bold">2 mins ago</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <TrendingUp size={14} /> Current Status
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                                        <span className="text-sm font-medium text-blue-50">Soil Moisture</span>
                                        <span className="text-sm font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/30">28% (Low)</span>
                                    </li>
                                    <li className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                                        <span className="text-sm font-medium text-blue-50">Soil Temperature</span>
                                        <span className="text-sm font-bold text-emerald-300">24°C (Optimal)</span>
                                    </li>
                                    <li className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                                        <span className="text-sm font-medium text-blue-50">Air Humidity</span>
                                        <span className="text-sm font-bold">65%</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Info size={14} /> Recommendation
                                </h3>
                                <p className="text-lg font-semibold leading-relaxed text-blue-50">
                                    Water your crop today because soil moisture is below the ideal range and temperature is high.
                                </p>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/10">
                            <h3 className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-4">Recommended Action</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Water Amount</p>
                                    <p className="text-xl font-black">500 L</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Method</p>
                                    <p className="text-base font-bold">Drip</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Duration</p>
                                    <p className="text-base font-bold">30 min</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Next Check</p>
                                    <p className="text-base font-bold">2 Days</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Water Efficiency Score */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 p-8 flex flex-col items-center justify-between text-center group">
                    <div>
                        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-8">Water Efficiency</h3>
                        <div className="relative w-44 h-44 mb-6">
                            {/* SVG Gauge */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="88"
                                    cy="88"
                                    r="80"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    className="text-gray-50"
                                />
                                <circle
                                    cx="88"
                                    cy="88"
                                    r="80"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 80}
                                    strokeDashoffset={2 * Math.PI * 80 * (1 - 0.85)}
                                    className="text-blue-500 transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
                                <span className="text-5xl font-black text-gray-900">85</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 w-full">
                        <div>
                            <h4 className="text-lg font-bold text-gray-900">Efficient Usage</h4>
                            <p className="text-sm font-medium text-emerald-500">Your water management is optimal.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-50">
                            <div className="text-left">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Saved This Week</p>
                                <p className="text-base font-black text-blue-600">120 L</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Improvement</p>
                                <p className="text-base font-black text-emerald-500">+15%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Sensor Data Cards */}
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Real-Time Sensor Monitoring</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {sensors.map((sensor, idx) => (
                    <SensorCard
                        key={idx}
                        title={sensor.title}
                        value={sensor.value}
                        unit={sensor.unit}
                        icon={sensor.icon}
                        status={sensor.status}
                        idealRange={sensor.idealRange}
                        trend={sensor.trend}
                    />
                ))}
            </div>

            {/* Middle Section: Trends and Requirements */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* 4. Soil Moisture Trend Graph */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Soil Moisture Trend</h3>
                            <p className="text-sm text-gray-500 font-medium">Last 24 hours analysis</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-600">March 9, 2026</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full relative">
                        <Line data={chartData} options={chartOptions} />
                    </div>

                    <div className="mt-6 flex items-center gap-6 justify-center text-xs font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="text-gray-500">Actual Moisture</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-1 bg-emerald-500/30 rounded-full"></span>
                            <span className="text-gray-400">Ideal Minimum (35%)</span>
                        </div>
                    </div>
                </div>

                {/* 6. Crop Water Requirement */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 p-8 flex flex-col group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] -rotate-12 translate-x-4 -translate-y-4">
                        <Activity size={180} />
                    </div>

                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">Crop Water Needs</h3>

                    <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                                <Search size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Active Crop</p>
                                <h4 className="text-xl font-black text-gray-900">Wheat</h4>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Growth Stage</p>
                                <p className="text-sm font-bold text-gray-700">Vegetative</p>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Need Level</p>
                                <p className="text-sm font-bold text-amber-600">Medium</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-blue-600 uppercase">Ideal Range</p>
                                    <p className="text-base font-black text-gray-800">35% – 55%</p>
                                </div>
                                <CheckCircle2 size={24} className="text-blue-200" />
                            </div>

                            <div className="flex justify-between items-center bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-amber-600 uppercase">Current Status</p>
                                    <p className="text-base font-black text-gray-800">28% <span className="text-xs font-bold text-amber-600 ml-1">(Below Ideal)</span></p>
                                </div>
                                <AlertCircle size={24} className="text-amber-300" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Schedule and Weather Impact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* 5. Irrigation Schedule */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Upcoming Schedule</h3>
                            <p className="text-sm text-gray-500 font-medium">Planned irrigation events</p>
                        </div>
                        <CalendarDays size={20} className="text-gray-300" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-8 py-5 text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Today</td>
                                    <td className="px-8 py-5 text-sm font-medium text-gray-600">4:00 PM</td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black">500 L</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <button className="p-2 text-gray-300 hover:text-emerald-500 transition-colors">
                                            <Play size={16} fill="currentColor" />
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-8 py-5 text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">March 12</td>
                                    <td className="px-8 py-5 text-sm font-medium text-gray-600">6:00 AM</td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black">350 L</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <button className="p-2 text-gray-300 hover:text-emerald-500 transition-colors">
                                            <Play size={16} fill="currentColor" />
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-8 py-5 text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">March 15</td>
                                    <td className="px-8 py-5 text-sm font-medium text-gray-600">5:00 PM</td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black">400 L</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <button className="p-2 text-gray-300 hover:text-emerald-500 transition-colors">
                                            <Play size={16} fill="currentColor" />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 7. Weather Impact on Irrigation */}
                <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl shadow-gray-200 flex flex-col h-full relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:rotate-12 transition-transform duration-500">
                        <CloudRain size={160} />
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Weather Forecast Impact</h3>

                        <div className="space-y-6 flex-1">
                            <div className="flex gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm group/item">
                                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl group-hover/item:scale-110 transition-transform">
                                    <CloudRain size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm text-blue-100 flex items-center gap-2">
                                        Rain expected in 2 days
                                        <span className="px-2 py-0.5 bg-blue-500/20 rounded-md text-[10px] text-blue-300">Action Suggested</span>
                                    </h4>
                                    <p className="text-sm text-gray-400 leading-relaxed font-medium">Reduce irrigation amount by <span className="text-white font-bold">20%</span> to prevent overwatering.</p>
                                </div>
                            </div>

                            <div className="flex gap-5 p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm group/item">
                                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl group-hover/item:scale-110 transition-transform">
                                    <Thermometer size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm text-amber-100 flex items-center gap-2">
                                        Heatwave Alert (36°C)
                                        <span className="px-2 py-0.5 bg-amber-500/20 rounded-md text-[10px] text-amber-300">Critical</span>
                                    </h4>
                                    <p className="text-sm text-gray-400 leading-relaxed font-medium">Temperature expected to reach 36°C tomorrow. <span className="text-white font-bold">Increase</span> monitoring frequency.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Real-time Forecast Active</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Sensor Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
                                    onClick={handleAddSensor}
                                    disabled={loading}
                                    className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {loading ? 'Adding...' : <><Save size={18} className="group-hover:scale-110 transition-transform" /> Save Sensor</>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </FarmerDashboardLayout>
    );
}
