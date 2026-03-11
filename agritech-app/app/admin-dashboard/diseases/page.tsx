'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { motion } from 'framer-motion';
import { 
    Bug, 
    AlertTriangle, 
    Calendar, 
    MapPin, 
    ChevronRight, 
    RefreshCw, 
    TrendingUp, 
    Activity, 
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    BadgeAlert,
    ScanLine,
    ShieldAlert
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const SeverityBadge = ({ severity }: { severity: string }) => {
    const isHigh = severity?.toLowerCase() === 'high';
    const isMedium = severity?.toLowerCase() === 'medium';
    
    return (
        <div className={`px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
            isHigh ? 'bg-red-50 text-red-600' : 
            isMedium ? 'bg-amber-50 text-amber-600' : 
            'bg-emerald-50 text-emerald-600'
        }`}>
            <AlertTriangle size={14} />
            {severity || 'Low'}
        </div>
    );
};

export default function DiseaseMonitoringPage() {
    const [scans, setScans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchScans() {
            setLoading(true);
            try {
                console.log("[Admin] Fetching scans, crops, and users for manual synchronization...");
                
                // Fetch scans
                const { data: scansData, error: scansError } = await supabase
                    .from('disease_scans')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (scansError) throw scansError;

                // Fetch context (Crops & Users)
                const [{ data: cropsData }, { data: usersData }] = await Promise.all([
                    supabase.from('crops').select('id, name'),
                    supabase.from('users').select('id, full_name, region')
                ]);

                // Manual Join
                const merged = (scansData || []).map(scan => ({
                    ...scan,
                    crops: cropsData?.find(c => c.id === scan.crop_id) || { name: 'Unknown Crop' },
                    users: usersData?.find(u => u.id === scan.user_id) || { full_name: 'Anonymous Farmer', region: 'Remote Location' }
                }));

                setScans(merged);
                console.log(`[Admin] Synchronized ${merged.length} scan records.`);
            } catch (err: any) {
                console.error("Scans fetch error detail:", err.message || err);
                
                // Hard mock fallback if everything fails
                setScans([
                    { id: '1', disease_detected: 'Leaf Rust', confidence: 94.2, severity: 'high', created_at: new Date().toISOString(), crops: { name: 'Wheat' }, users: { full_name: 'System Demo', region: 'Nashik' } }
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchScans();
    }, []);

    const outbreaks = [
        { crop: 'Corn', disease: 'Common Rust', location: 'Nashik Cluster A', spread: 'High', trend: 'up', trendVal: 15 },
        { crop: 'Rice', disease: 'Leaf Blast', location: 'Pune Farm-B', spread: 'Medium', trend: 'down', trendVal: 8 },
        { crop: 'Mango', disease: 'Anthracnose', location: 'Ahmednagar Estate', spread: 'Low', trend: 'up', trendVal: 3 },
    ];

    return (
        <AdminLayout>
            <div className="space-y-12">
                {/* Outbreak Snapshot */}
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3 bg-[#0F172A] rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col justify-between">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                         <div className="relative z-10">
                            <h3 className="text-3xl font-black mb-6">Regional <span className="text-red-500">Outbreaks</span></h3>
                            <div className="space-y-6">
                                {outbreaks.map((outbreak, idx) => (
                                    <div key={idx} className="p-5 bg-white/5 rounded-3xl border border-white/10 group hover:bg-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-black text-white group-hover:text-red-400 transition-colors uppercase tracking-widest text-sm">{outbreak.disease}</h4>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{outbreak.crop} • {outbreak.location}</p>
                                            </div>
                                            <div className={`p-2 rounded-xl bg-${outbreak.trend === 'up' ? 'red' : 'emerald'}-400/10 text-${outbreak.trend === 'up' ? 'red' : 'emerald'}-400 flex items-center gap-1 text-[10px] font-black uppercase`}>
                                                {outbreak.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                                {outbreak.trendVal}%
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${
                                                    outbreak.spread === 'High' ? 'w-[85%] bg-red-500' : 
                                                    outbreak.spread === 'Medium' ? 'w-[50%] bg-amber-500' : 
                                                    'w-[20%] bg-emerald-500'
                                                }`} />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{outbreak.spread} SPREAD</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>
                         <button className="relative z-10 mt-10 py-5 bg-red-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/10 hover:bg-red-700 transition-all flex items-center justify-center gap-3 group">
                            <ShieldAlert size={20} className="group-hover:animate-pulse" />
                            Trigger Outbreak Alert
                         </button>
                    </div>

                    <div className="flex-1 space-y-8">
                        {/* Live Feed Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Active Detection <span className="text-agri-green">Feed</span></h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Streaming telemetry via Computer Vision nodes.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Search size={22} className="text-gray-300 hover:text-agri-green cursor-pointer" />
                                <BarChart3 size={22} className="text-gray-300 hover:text-agri-green cursor-pointer" />
                            </div>
                        </div>

                        {/* Disease Stream List */}
                        <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 p-4 space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest italic">Initializing Intelligence Stream...</div>
                            ) : scans.length === 0 ? (
                                <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest italic">No detections in current frame buffer.</div>
                            ) : scans.map((scan, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={scan.id} 
                                    className="p-8 rounded-[2.5rem] bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-gray-200 border border-transparent hover:border-gray-100 transition-all group flex flex-col md:flex-row md:items-center gap-8"
                                >
                                    {/* Crop Preview */}
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl ring-4 ring-white shrink-0 group-hover:scale-110 transition-transform bg-gray-200">
                                        {scan.image_url ? (
                                            <img src={scan.image_url} alt="detection" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <ScanLine size={32} strokeWidth={1} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Data Section */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xl font-black text-gray-900 group-hover:text-red-500 transition-colors tracking-tight">{scan.disease_detected}</h4>
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">{new Date(scan.created_at).toLocaleTimeString()} • {new Date(scan.created_at).toLocaleDateString()}</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Crop Context</p>
                                                <p className="font-black text-xs text-gray-700 uppercase tracking-widest flex items-center gap-2"><MapPin size={12} className="text-agri-green" /> {scan.crops?.name || 'Unknown Crop'}</p>
                                            </div>
                                             <div className="space-y-1">
                                                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Farmer & Zone</p>
                                                 <p className="font-black text-xs text-gray-700 uppercase tracking-widest text-ellipsis overflow-hidden">
                                                     {scan.users?.full_name || 'Anonymous Farmer'} 
                                                     <span className="block text-[8px] opacity-50">{scan.users?.region || 'Maharashtra Central'}</span>
                                                 </p>
                                             </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">CNN Confidence</p>
                                                <div className="flex items-center gap-2 font-black text-xs text-gray-700">
                                                    {scan.confidence || 0}%
                                                    <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-agri-green rounded-full" style={{ width: `${scan.confidence || 0}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end">
                                               <SeverityBadge severity={scan.severity} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button className="p-4 bg-white rounded-2xl shadow-sm text-gray-400 hover:text-agri-green hover:shadow-xl transition-all border border-gray-100">
                                        <ChevronRight size={20} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
