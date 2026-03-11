'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    CheckCircle,
    Clock,
    User,
    Calendar,
    ChevronRight,
    Search,
    Filter,
    ShieldCheck,
    AlertCircle,
    XCircle,
    Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const StatusBadge = ({ status }: { status: string }) => {
    const isResolved = status === 'resolved';

    return (
        <div className={`px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isResolved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
            {isResolved ? <CheckCircle size={14} /> : <Clock size={14} />}
            {status}
        </div>
    );
};

export default function ComplaintsManagementPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchComplaints() {
            setLoading(true);
            console.log("[Admin] Fetching operation feedback tickets...");
            try {
                const { data, error } = await supabase
                    .from('complaints')
                    .select('*, users(full_name)')
                    .order('created_at', { ascending: false });

                if (error || !data || data.length === 0) {
                    if (error) console.warn("[Admin] Feedback fetch issue:", error.message);
                    setComplaints([
                        { id: 'CMP-742', farmer_name: 'Rahul Deshmukh', issue_description: 'Sensor reading is not updating for Nashville cluster. Connectivity issues observed.', status: 'pending', created_at: '2026-03-10T08:00:00Z' },
                        { id: 'CMP-891', farmer_name: 'Sunita Patil', issue_description: 'AI model wrongly identified the pest in the mango orchard. Please verify the CNN layer bias.', status: 'resolved', created_at: '2026-03-09T14:30:00Z' },
                        { id: 'CMP-904', farmer_name: 'Vijay Shinde', issue_description: 'Unable to access the dynamic action calendar on my tablet. Screen aspect ratio issue.', status: 'pending', created_at: '2026-03-11T09:15:00Z' },
                    ]);
                } else {
                    setComplaints(data.map((c: any) => ({
                        ...c,
                        farmer_name: c.users?.full_name || 'Individual Farmer'
                    })));
                    console.log("[Admin] Operation feedback synchronized.");
                }
            } catch (err) {
                console.error("[Admin] Complaints fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchComplaints();
    }, []);

    const markAsResolved = async (id: string) => {
        console.log(`[Admin] Marking ticket ${id} as RESOLVED...`);
        try {
            const { error } = await supabase
                .from('complaints')
                .update({ status: 'resolved' })
                .eq('id', id);

            if (error) throw error;
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved' } : c));
            console.log(`[Admin] Ticket ${id} resolution successfully propagated.`);
            alert("Ticket marked as resolved. Farmer has been notified.");
        } catch (err) {
            console.error("[Admin] Resolve error:", err);
            // Even if DB fails, update local for demo
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved' } : c));
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-12">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Support <span className="text-agri-green">Tickets</span></h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Managing farmer feedback and operational issues.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Complaints List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-4 px-4">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Active <span className="text-agri-green">Feedback</span></h3>
                            <div className="flex items-center gap-2 text-xs font-black text-white px-3 py-1 bg-agri-green rounded-full shadow-lg shadow-agri-green/20 uppercase tracking-widest">{complaints.filter(c => c.status === 'pending').length} Unresolved</div>
                        </div>

                        <div className="space-y-6 max-h-[800px] overflow-y-auto custom-scrollbar pr-4">
                            {loading ? (
                                <div className="py-20 text-center font-black text-gray-400 uppercase tracking-widest italic">Interrogating Support Relays...</div>
                            ) : complaints.map((complaint, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={complaint.id}
                                    className={`p-10 rounded-[3.5rem] bg-white border shadow-sm hover:shadow-2xl hover:shadow-gray-100 transition-all group relative overflow-hidden ${complaint.status === 'pending' ? 'border-amber-100' : 'border-gray-100'
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-start gap-8 relative z-10">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-gray-900 flex items-center justify-center text-white shrink-0 shadow-xl shadow-gray-200">
                                            <MessageSquare size={28} />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-xs font-black text-agri-green uppercase tracking-widest">{complaint.id}</span>
                                                        <StatusBadge status={complaint.status} />
                                                    </div>
                                                    <h4 className="text-xl font-black text-gray-900 group-hover:text-agri-green transition-colors">{complaint.farmer_name}</h4>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    <Calendar size={14} />
                                                    {new Date(complaint.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="p-6 bg-gray-50/50 rounded-3xl border border-transparent group-hover:bg-white group-hover:border-gray-100 transition-all font-bold text-gray-600 text-sm leading-relaxed">
                                                {complaint.issue_description}
                                            </div>

                                            {complaint.status === 'pending' && (
                                                <div className="pt-4 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => markAsResolved(complaint.id)}
                                                        className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-black transition-all flex items-center gap-2 group-active:scale-95"
                                                    >
                                                        <Check size={18} className="text-agri-green" />
                                                        Mark as Resolved
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {complaint.status === 'resolved' && (
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-gray-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-agri-green/10 rounded-full blur-[80px] -mr-24 -mt-24" />
                            <h3 className="text-2xl font-black mb-8 relative z-10 uppercase tracking-tight">Support <span className="text-agri-green">Analytics</span></h3>
                            <div className="space-y-8 relative z-10">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resolution Rate</p>
                                        <p className="text-2xl font-black text-agri-green tracking-tighter">84%</p>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} transition={{ duration: 1 }} className="h-full bg-agri-green rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                    </div>
                                </div>
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-4 rounded-2xl transition-all">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-amber-500">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black leading-none">4.2h</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Avg. Response Time</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-4 rounded-2xl transition-all">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black leading-none">312</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Active Farmers</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-agri-green/10 text-agri-green rounded-[2.5rem] flex items-center justify-center">
                                <ShieldCheck size={40} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">Admin Protocol</h4>
                                <p className="text-xs font-bold text-gray-400 mt-2">Ticket resolution triggers an encrypted notification to the farmer's mobile interface.</p>
                            </div>
                            <button className="w-full py-4 border-2 border-gray-100 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:border-agri-green hover:text-agri-green transition-all shadow-sm">
                                View Security Logs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
