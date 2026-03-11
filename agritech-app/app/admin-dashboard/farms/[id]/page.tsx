'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { 
    Sprout, 
    Droplets, 
    Zap, 
    AlertCircle, 
    ArrowLeft, 
    BadgeCheck, 
    TrendingUp, 
    Activity,
    LineChart,
    PieChart,
    Layers,
    MessageCircle,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function FarmDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [farm, setFarm] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [advice, setAdvice] = useState<any[]>([]);
    const [sensors, setSensors] = useState<any[]>([]);

    useEffect(() => {
        async function fetchFarmData() {
            if (!id) return;
            setLoading(true);
            try {
                // Fetch crop details
                const { data: cropData, error: cropError } = await supabase
                    .from('crops')
                    .select('*, users!user_id(*)')
                    .eq('id', id)
                    .single();

                if (cropError) throw cropError;
                setFarm(cropData);

                // Fetch recommendations (Smart Farming Advice)
                const { data: adviceData } = await supabase
                    .from('recommendations')
                    .select('*')
                    .eq('crop_id', id)
                    .order('created_at', { ascending: false });
                
                setAdvice(adviceData || []);

                // Fetch recent sensor data for charts
                const { data: sensorData } = await supabase
                    .from('iot_sensors')
                    .select('*')
                    .eq('crop_id', id)
                    .order('timestamp', { ascending: false })
                    .limit(20);

                setSensors(sensorData || []);

            } catch (err) {
                console.error("Farm detail fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchFarmData();
    }, [id]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-agri-green/20 border-t-agri-green rounded-full animate-spin" />
                </div>
            </AdminLayout>
        );
    }

    if (!farm) {
        return (
            <AdminLayout>
                <div className="text-center py-20">
                    <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
                    <h2 className="text-2xl font-black text-gray-900 uppercase">Farm Not Found</h2>
                    <button onClick={() => router.back()} className="mt-6 text-agri-green font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 mx-auto">
                        <ArrowLeft size={16} /> Back to Monitoring
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-12 pb-20">
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => router.back()}
                            className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-agri-green hover:shadow-xl transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{farm.name} <span className="text-agri-green">Analytics</span></h2>
                                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                                    {farm.health_status}
                                </span>
                            </div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                <BadgeCheck size={14} className="text-blue-500" />
                                Assigned to {farm.users?.full_name} • ID: {farm.id.slice(0, 8).toUpperCase()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:border-agri-green transition-all shadow-sm">
                            Export Raster Data
                        </button>
                        <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                            Deploy UAV Drone
                        </button>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Stats & Advice */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Area', value: `${farm.area} Acres`, icon: Sprout, color: 'emerald' },
                                { label: 'Growth Stage', value: farm.current_stage || 'Vegetative', icon: Layers, color: 'blue' },
                                { label: 'Avg moisture', value: sensors.filter(s => s.sensor_type === 'soil_moisture')[0]?.value + '%' || '32%', icon: Droplets, color: 'blue' },
                                { label: 'Efficiency', value: '88%', icon: Activity, color: 'amber' },
                            ].map((stat, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={i} 
                                    className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Smart Farming Advice */}
                        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-5">
                                <Zap size={120} className="text-agri-green" />
                            </div>
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Smart Farming <span className="text-agri-green">Advice</span></h3>
                                    <div className="px-4 py-1.5 bg-agri-green/10 text-agri-green rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {advice.length} Active Insights
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {advice.length === 0 ? (
                                        <div className="py-10 text-center text-gray-400 font-bold uppercase tracking-widest italic border-2 border-dashed border-gray-100 rounded-[2rem]">
                                            Ecosystem stable. No immediate actions required.
                                        </div>
                                    ) : advice.map((item, idx) => (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            key={item.id} 
                                            className="p-6 rounded-[2rem] border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-gray-200 transition-all group flex items-start gap-6"
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                                item.priority === 'high' ? 'bg-red-50 text-red-600' : 
                                                item.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                                {item.type === 'water' ? <Droplets size={24} /> : <Zap size={24} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-lg font-black text-gray-900 group-hover:text-agri-green transition-colors uppercase tracking-tight">{item.title}</h4>
                                                    <span className="text-[10px] font-black text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm font-bold text-gray-500 leading-relaxed mb-4">{item.description}</p>
                                                <div className="flex items-center gap-4">
                                                    <button className="px-4 py-2 bg-agri-green text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all">
                                                        Deploy Instruction
                                                    </button>
                                                    {item.is_completed && (
                                                        <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase">
                                                            <CheckCircle2 size={14} /> Farmer Executed
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sensor Monitoring & Farmer Profile */}
                    <div className="space-y-10">
                        {/* Farmer Context Card */}
                        <div className="bg-[#0F172A] rounded-[3rem] p-10 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-agri-green/10 transition-colors" />
                            <h3 className="text-xl font-black mb-8 border-b border-white/10 pb-4 uppercase tracking-tighter">Farmer <span className="text-agri-green">Profile</span></h3>
                            
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-3xl font-black border border-white/5">
                                        {farm.users?.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Primary Operator</p>
                                        <p className="text-xl font-black uppercase tracking-tight">{farm.users?.full_name}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 bg-white/5 rounded-[2rem] p-6 border border-white/5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Region</span>
                                        <span className="text-sm font-black">{farm.users?.region}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Language</span>
                                        <span className="text-sm font-black uppercase">{farm.users?.language}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</span>
                                        <span className="text-sm font-black">{farm.users?.phone}</span>
                                    </div>
                                </div>

                                <button className="w-full py-5 bg-white text-[#0F172A] rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-agri-green hover:text-white transition-all flex items-center justify-center gap-3">
                                    <MessageCircle size={18} /> Direct Line to Farmer
                                </button>
                            </div>
                        </div>

                        {/* Live Telemetry Feed */}
                        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Sensor <span className="text-agri-green">Live Feed</span></h3>
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            </div>

                            <div className="space-y-4">
                                {sensors.slice(0, 5).map((s, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-agri-green/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-agri-green shadow-sm">
                                                <Activity size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">{s.sensor_type}</p>
                                                <p className="text-sm font-black text-gray-900">{s.value}{s.unit}</p>
                                            </div>
                                        </div>
                                        <div className="text-[8px] font-black text-gray-300 uppercase">
                                            {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-agri-green-600 transition-all">
                                View Full Signal Log
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
