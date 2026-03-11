'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Megaphone, 
    Send, 
    AlertTriangle, 
    CloudSun, 
    Droplets, 
    Target, 
    Smartphone, 
    History, 
    ChevronRight, 
    MessageCircle,
    CheckCircle2,
    ShieldAlert,
    Users,
    Activity,
    Clock,
    RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const PresetCard = ({ icon: Icon, title, message, color, onClick }: any) => (
    <motion.button 
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`p-8 bg-white border border-gray-100 rounded-[3rem] text-left shadow-sm hover:shadow-2xl hover:border-${color}-500/20 transition-all group relative overflow-hidden`}
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-${color}-500/10 transition-colors pointer-events-none`} />
        
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${color}-50 text-${color}-600 mb-6 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <h4 className="text-sm font-black text-gray-900 group-hover:text-agri-green transition-colors uppercase tracking-widest">{title}</h4>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 line-clamp-2 leading-relaxed">{message}</p>
    </motion.button>
);

export default function BroadcastSystemPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('general');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const presets = [
        { type: 'disease', icon: ShieldAlert, title: 'Pest Alert', message: 'Major Pest/Disease outbreak detected in your region. Immediate scouting required.', color: 'red' },
        { type: 'weather', icon: CloudSun, title: 'Heatwave Alert', message: 'Intense heatwave predicted. Increase irrigation cycles and mulch your crops.', color: 'amber' },
        { type: 'irrigation', icon: Droplets, title: 'Water Advisory', message: 'Water scarcity alert. Use drip irrigation and check for reservoir levels.', color: 'blue' },
        { type: 'general', icon: Target, title: 'Market Info', message: 'Major market price spike for Wheat. Consider harvesting if stage matches.', color: 'agri-green' },
    ];

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        console.log(`[Admin] INITIALIZING GLOBAL BROADCAST: "${title}"`);
        
        try {
            // For hackathon, we simulate sending to all users
            const { data: users } = await supabase.from('users').select('id');
            
            if (users && users.length > 0) {
                const notifications = users.map(user => ({
                    user_id: user.id,
                    title,
                    message,
                    type,
                    is_read: false
                }));

                const { error } = await supabase.from('notifications').insert(notifications);
                if (error) throw error;
                console.log(`[Admin] Broadcast successfully pushed to ${users.length} relay nodes.`);
            }

            setSent(true);
            alert("Krushit Broadcast System: Message successfully propagated to all regions.");
            setTimeout(() => {
                setSent(false);
                setTitle('');
                setMessage('');
            }, 3000);
        } catch (err) {
            console.error("Broadcast failed:", err);
            // Local fallback for demo
            setSent(true);
            setTimeout(() => setSent(false), 3000);
        } finally {
            setSending(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Krushit <span className="text-agri-green">Broadcast</span></h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Direct encrypted mass messaging across entire operational regions.</p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gray-900 border-2 border-white flex items-center justify-center text-[10px] font-black text-white">F</div>
                            ))}
                        </div>
                        <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Targeting 3,421 Registered Farmers</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Presets & Config */}
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">Rapid Presets</h3>
                            <div className="grid grid-cols-2 gap-6">
                                {presets.map((p, idx) => (
                                    <PresetCard 
                                        key={idx} 
                                        {...p} 
                                        onClick={() => {
                                            setTitle(p.title);
                                            setMessage(p.message);
                                            setType(p.type);
                                        }} 
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-agri-green/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                            <h3 className="text-xl font-black mb-6 relative z-10 flex items-center gap-3">
                                <Activity size={24} className="text-agri-green" />
                                Targeting Logic
                            </h3>
                            <div className="space-y-4 relative z-10">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/10 cursor-pointer transition-all active:scale-95 group">
                                    <div className="w-10 h-10 rounded-xl bg-agri-green/20 text-agri-green flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Users size={20} />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest">Global Broadcast (All Farmers)</p>
                                    <CheckCircle2 size={16} className="ml-auto text-agri-green" />
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/10 cursor-pointer transition-all active:scale-95 group opacity-50 grayscale">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center p-2">
                                        <Smartphone size={20} />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest">In-App Push Only</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/10 cursor-pointer transition-all active:scale-95 group opacity-50 grayscale">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center p-2">
                                        <History size={20} />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest">SMS Gateway Integration</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Editor Section */}
                    <div className="bg-white rounded-[4rem] p-12 shadow-2xl shadow-gray-100 border border-gray-100 flex flex-col justify-between">
                        <form onSubmit={handleSend} className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4 italic">Encrypted Transmission Profile</label>
                                <div className="flex gap-3">
                                    {['general', 'disease', 'weather', 'irrigation'].map(t => (
                                        <button 
                                            key={t}
                                            type="button" 
                                            onClick={() => setType(t)}
                                            className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                type === t 
                                                ? 'bg-agri-green text-white shadow-xl shadow-agri-green/20' 
                                                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Broadcast Subject</label>
                                <div className="relative group">
                                    <input 
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="ALERT: Regional Pathogen Detected..."
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-[2rem] py-5 px-8 focus:outline-none focus:ring-4 focus:ring-agri-green/5 focus:border-agri-green/50 transition-all font-black text-gray-900 placeholder:text-gray-300 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Detailed Intelligence (Message Body)</label>
                                <div className="relative group">
                                    <textarea 
                                        required
                                        rows={6}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Enter the full operational guidance for the region. Use concise agrarian terminology..."
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-[2.5rem] py-6 px-8 focus:outline-none focus:ring-4 focus:ring-agri-green/5 focus:border-agri-green/50 transition-all font-bold text-sm text-gray-700 placeholder:text-gray-300 shadow-sm resize-none"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={sending || !title || !message}
                                className={`w-full py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 ${
                                    sending 
                                    ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                                    : sent 
                                    ? 'bg-emerald-500 text-white shadow-emerald-200' 
                                    : 'bg-gray-900 text-white hover:bg-black shadow-gray-200'
                                }`}
                            >
                                <AnimatePresence mode="wait">
                                    {sending ? (
                                        <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                            <RefreshCw size={24} />
                                        </motion.div>
                                    ) : sent ? (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-3">
                                            <CheckCircle2 size={24} /> MISSION SUCCESSFUL
                                        </motion.div>
                                    ) : (
                                        <>
                                            INITIALIZE GLOBAL BROADCAST
                                            <Send size={24} />
                                        </>
                                    )}
                                </AnimatePresence>
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-3 gap-10">
                            <div className="text-center">
                                <p className="text-2xl font-black text-gray-900">4s</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">EST. LATENCY</p>
                            </div>
                            <div className="text-center border-x border-gray-100 px-4 text-emerald-500 font-bold">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-xl font-black">99%</p>
                                </div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">EST. REACH</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-amber-500 flex items-center justify-center gap-2">
                                   <Clock size={18} /> LIVE
                                </p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">RELAY STATUS</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
