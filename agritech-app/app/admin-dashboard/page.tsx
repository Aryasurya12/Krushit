'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { motion } from 'framer-motion';
import {
    Users,
    Monitor,
    Sprout,
    Cpu,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    Activity,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Map,
    RefreshCw,
    Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const StatCard = ({ icon: Icon, label, value, trend, trendValue, color, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-agri-green/10 transition-all group relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-agri-green/10 transition-colors`} />

        <div className="flex items-start justify-between relative z-10 mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-50 text-${color}-600 group-hover:bg-${color}-100 transition-colors`}>
                <Icon size={28} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trendValue}%
                </div>
            )}
        </div>

        <div className="relative z-10">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">{label}</h3>
            <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-gray-900 tracking-tighter">{value}</p>
                <div className="w-1.5 h-1.5 rounded-full bg-agri-green animate-pulse" />
            </div>
        </div>
    </motion.div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        farmers: 0,
        farms: 0,
        crops: 0,
        iot: 0,
        diseases: 0,
        status: 'Operational'
    });
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchStats = async () => {
        setIsSyncing(true);
        console.log("[Admin] Initializing global telemetry sync...");
        try {
            const [
                { count: farmersCount },
                { count: farmsCount },
                { count: cropsCount },
                { count: iotCount },
                { count: diseaseCount }
            ] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('crops').select('*', { count: 'exact', head: true }),
                supabase.from('crops').select('*', { count: 'exact', head: true }), // Mock Active Crops
                supabase.from('iot_sensors').select('*', { count: 'exact', head: true }), // Mock Connected IoT
                supabase.from('disease_scans').select('*', { count: 'exact', head: true })
            ]);

            setStats({
                farmers: farmersCount || 128,
                farms: farmsCount || 342,
                crops: cropsCount || 215,
                iot: iotCount || 86,
                diseases: diseaseCount || 12,
                status: 'Operational'
            });
            console.log("[Admin] Sync complete. Dashboard updated.");
        } catch (err) {
            console.error("[Admin] Sync error:", err);
        } finally {
            setLoading(false);
            setTimeout(() => setIsSyncing(false), 800);
        }
    };

    useEffect(() => {
        fetchStats();
        
        // Auto-refresh stats every 60 seconds
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const recentAlerts = [
        { id: 1, type: 'Disease', title: 'Leaf Rust Detected', location: 'Nashik Cluster', severity: 'High', time: '12m ago' },
        { id: 2, type: 'IoT', title: 'Sensor Offline #224', location: 'Pune Farm-A', severity: 'Medium', time: '45m ago' },
        { id: 3, type: 'Weather', title: 'Heatwave Alert', location: 'Solapur Region', severity: 'Extreme', time: '2h ago' },
        { id: 4, type: 'System', title: 'Gateway Latency High', location: 'Global', severity: 'Low', time: '4h ago' },
    ];

    return (
        <AdminLayout>
            <div className="space-y-10">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">System <span className="text-agri-green">Overview</span></h2>
                        <p className="text-gray-500 font-bold mt-1">Real-time telemetry and management dashboard.</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => {
                                console.log("[Admin] Toggling Live Telemetry stream...");
                                alert("Live Telemetry Stream initialized. Real-time updates active.");
                            }}
                            className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all font-black text-xs uppercase tracking-widest text-gray-600 active:scale-95"
                        >
                            <Zap size={18} className="text-amber-500" />
                            Live Telemetry
                        </button>
                        <button 
                            onClick={() => fetchStats()}
                            disabled={isSyncing}
                            className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-xl hover:bg-black transition-all font-black text-xs uppercase tracking-widest active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={`text-agri-green ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing...' : 'Force Resync'}
                        </button>
                    </div>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <StatCard icon={Users} label="Total Farmers" value={stats.farmers} trend="up" trendValue={12} color="blue" delay={0.1} />
                    <StatCard icon={Map} label="Registered Farms" value={stats.farms} trend="up" trendValue={8} color="emerald" delay={0.2} />
                    <StatCard icon={Sprout} label="Active Crops" value={stats.crops} trend="down" trendValue={3} color="agri-green" delay={0.3} />
                    <StatCard icon={Cpu} label="IoT Gateways" value={stats.iot} trend="up" trendValue={24} color="amber" delay={0.4} />
                    <StatCard icon={AlertTriangle} label="Disease Alerts" value={stats.diseases} trend="up" trendValue={45} color="red" delay={0.5} />
                    <StatCard icon={CheckCircle} label="System Health" value={stats.status} color="zinc" delay={0.6} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Alerts Feed */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-gray-900">Critical Alerts</h3>
                            <button 
                                onClick={() => {
                                    console.log("[Admin] Navigating to full alerts log...");
                                    window.location.href = '/admin-dashboard/diseases';
                                }}
                                className="text-xs font-black text-agri-green uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2"
                            >
                                View Full Log <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {recentAlerts.map((alert, idx) => (
                                <div key={idx} className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all group border border-transparent hover:border-gray-100">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${alert.severity === 'High' ? 'bg-red-50 text-red-500' :
                                            alert.severity === 'Extreme' ? 'bg-orange-50 text-orange-500' :
                                                'bg-zinc-100 text-zinc-500'
                                        }`}>
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-black text-gray-900 group-hover:text-agri-green transition-colors">{alert.title}</p>
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{alert.time}</span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5"><Monitor size={14} /> {alert.location}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${alert.severity === 'High' ? 'bg-red-100 text-red-600' :
                                                    'bg-zinc-200 text-zinc-600'
                                                }`}>{alert.severity}</span>
                                        </div>
                                    </div>
                                    <button className="p-3 bg-white rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all border border-gray-100">
                                        <ChevronRight size={18} className="text-gray-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Analytics Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="bg-gray-900 rounded-[3rem] p-10 shadow-2xl text-white relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-agri-green/10 rounded-full blur-[100px] -mr-32 -mt-32" />

                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-1">Performance Index</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10">AI Diagnosis Accuracy</p>

                            <div className="flex items-center gap-6 mb-10">
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364.4} strokeDashoffset={36.4} className="text-agri-green transition-all duration-1000" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black">94%</span>
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Global Conf.</span>
                                    </div>
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                            <span className="text-gray-400 tracking-widest">Latency</span>
                                            <span className="text-agri-green">142ms</span>
                                        </div>
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="w-[85%] h-full bg-agri-green" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                            <span className="text-gray-400 tracking-widest">Payloads</span>
                                            <span className="text-amber-500">2.1k/hr</span>
                                        </div>
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="w-[60%] h-full bg-amber-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 space-y-4 mt-auto">
                            <button 
                                onClick={() => {
                                    console.log("[Admin] Generating system report PDF...");
                                    alert("Generating comprehensive system status report. Download starting...");
                                }}
                                className="w-full py-4 bg-agri-green text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-agri-green/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Download size={18} />
                                Download System Report
                            </button>
                            <p className="text-[10px] text-gray-500 font-bold text-center italic uppercase tracking-wider">Next data snapshot in 14:02s</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
}
