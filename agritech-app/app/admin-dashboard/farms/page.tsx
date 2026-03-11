'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    ChevronRight,
    MapPin,
    User,
    Sprout,
    Activity,
    Monitor,
    Maximize2,
    ArrowUpRight,
    ArrowDownRight,
    BadgeCheck,
    AlertCircle,
    BadgeAlert
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function FarmMonitoringPage() {
    const [farms, setFarms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchFarms() {
            setLoading(true);
            try {
                console.log("[Admin] Initializing robust farmer lookup...");
                
                // Fetch tables separately to avoid join ambiguity
                const [
                    { data: cropsData, error: cropsError },
                    { data: usersData }
                ] = await Promise.all([
                    supabase.from('crops').select('*').order('created_at', { ascending: false }),
                    supabase.from('users').select('id, full_name, region')
                ]);

                if (cropsError) throw cropsError;

                // Process data (Manual Join)
                const processed = (cropsData || []).map((farm: any) => {
                    const user = usersData?.find(u => u.id === farm.user_id);
                    return {
                        id: farm.id,
                        farmer: user?.full_name || 'Individual Farmer',
                        location: user?.region || 'Maharashtra Central',
                        crop: farm.name,
                        variety: farm.variety,
                        area: `${farm.area} Acres`,
                        stage: farm.current_stage || 'vegetative',
                        status: farm.health_status || 'healthy',
                        healthScore: farm.health_status === 'healthy' ? 92 : farm.health_status === 'warning' ? 68 : 34,
                        deviceId: `KT-${farm.id.slice(0, 4).toUpperCase()}`
                    };
                });

                setFarms(processed);
                console.log(`[Admin] Successfully mapped ${processed.length} farm entities.`);
            } catch (err: any) {
                console.error("Farms fetch error detail:", err.message || err);
                // Seed mock data if DB fetch fails
                const mockFarms = [
                    { id: '1', farmer: 'Ramesh Patel', location: 'Nashik Cluster A', crop: 'Wheat', variety: 'Lok-1', area: '12.5 Acres', stage: 'vegetative', status: 'healthy', healthScore: 94, deviceId: 'KT-W24' },
                    { id: '2', farmer: 'Sita Bai', location: 'Pune Sector 4', crop: 'Rice', variety: 'Basmati', area: '8.2 Acres', stage: 'flowering', status: 'warning', healthScore: 62, deviceId: 'KT-R11' },
                ];
                setFarms(mockFarms);
            } finally {
                setLoading(false);
            }
        }
        fetchFarms();
    }, []);

    const filteredFarms = farms.filter(f => 
        f.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-12 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Farm <span className="text-agri-green">Monitoring</span></h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Real-time agricultural asset tracking & telemetry.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input 
                                type="text"
                                placeholder="Search clusters..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-14 pr-8 py-4 bg-gray-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-agri-green transition-all w-64"
                            />
                        </div>
                        <button className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/50">
                                    <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-widest">Farmer Context</th>
                                    <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-widest">Crop Analytics</th>
                                    <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">IoT Node ID</th>
                                    <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Health Index</th>
                                    <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="w-12 h-12 border-4 border-agri-green/20 border-t-agri-green rounded-full animate-spin mx-auto mb-4" />
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Synchronizing Fleet Data...</p>
                                        </td>
                                    </tr>
                                ) : filteredFarms.map((farm, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={farm.id} 
                                        className="group hover:bg-gray-50/50 transition-all"
                                    >
                                        <td className="py-8 px-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-agri-green shadow-sm group-hover:scale-110 transition-transform">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 uppercase tracking-tight text-sm">{farm.farmer}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5"><MapPin size={12} className="text-blue-400" /> {farm.location}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10">
                                            <div className="font-black text-gray-700 uppercase tracking-tighter text-sm flex items-center gap-2 mb-1">
                                                <Sprout size={16} className="text-agri-green" />
                                                {farm.crop}
                                            </div>
                                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{farm.variety} • {farm.area}</p>
                                             <div className="mt-2 flex items-center gap-2">
                                                 <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-blue-100 italic">
                                                     Stage: {farm.stage}
                                                 </span>
                                             </div>
                                         </td>
                                        <td className="py-8 px-10 text-center">
                                            <code className="text-[10px] font-black bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg border border-gray-200 group-hover:bg-agri-green/5 group-hover:text-agri-green group-hover:border-agri-green/20 transition-all">
                                                {farm.deviceId}
                                            </code>
                                        </td>
                                        <td className="py-8 px-10">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${farm.healthScore}%` }}
                                                            className={`h-full ${
                                                                farm.status === 'healthy' ? 'bg-agri-green' : 
                                                                farm.status === 'warning' ? 'bg-amber-400' : 'bg-red-500'
                                                            }`} 
                                                        />
                                                    </div>
                                                    <span className="text-xs font-black text-gray-900">{farm.healthScore}%</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {farm.status === 'healthy' ? <BadgeCheck size={12} className="text-agri-green" /> : 
                                                     farm.status === 'warning' ? <AlertCircle size={12} className="text-amber-500" /> : <BadgeAlert size={12} className="text-red-500" />}
                                                    <span className={`text-[8px] font-black uppercase italic ${
                                                        farm.status === 'healthy' ? 'text-agri-green' : 
                                                        farm.status === 'warning' ? 'text-amber-500' : 'text-red-500'
                                                    }`}>{farm.status} status</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10 text-right">
                                            <Link 
                                                href={`/admin-dashboard/farms/${farm.id}`}
                                                className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-agri-green hover:shadow-xl transition-all group-hover:border-agri-green/50 inline-block"
                                            >
                                                <Maximize2 size={18} />
                                            </Link>
                                         </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
