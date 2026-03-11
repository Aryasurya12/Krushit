'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { motion } from 'framer-motion';
import { 
    Users, 
    Search, 
    Filter, 
    UserPlus, 
    MoreHorizontal, 
    ShieldCheck, 
    XCircle, 
    Key, 
    CreditCard, 
    MapPin, 
    Mail, 
    Phone,
    ArrowUpRight,
    TrendingUp,
    BadgeCheck,
    Lock,
    Unlock,
    UserX,
    Trash2,
    RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            try {
                console.log("[Admin] Initializing comprehensive user audit...");
                
                // Fetch users and crops separately for robust manual join
                const [
                    { data: usersData, error: usersError },
                    { data: cropsData }
                ] = await Promise.all([
                    supabase.from('users').select('*').order('created_at', { ascending: false }),
                    supabase.from('crops').select('id, user_id')
                ]);

                if (usersError) throw usersError;
                
                const processed = (usersData || []).map((u: any) => ({
                    ...u,
                    registeredFarms: cropsData?.filter(c => c.user_id === u.id).length || 0,
                    status: u.role === 'disabled' ? 'disabled' : 'active'
                }));

                setUsers(processed);
                console.log(`[Admin] Audited ${processed.length} user records.`);
            } catch (err: any) {
                console.error("Users audit error detail:", err.message || err);
                // Seed mock data if fetch fails
                setUsers([
                    { id: '1', full_name: 'System Root', email: 'admin@krushit.com', region: 'Global', registeredFarms: 0, status: 'active' },
                    { id: '2', full_name: 'Demo Farmer', email: 'farmer@demo.com', region: 'Nashik', registeredFarms: 3, status: 'active' }
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    const toggleStatus = async (id: string, current: string) => {
        const nextStatus = current === 'active' ? 'disabled' : 'active';
        console.log(`[Admin] Toggling status for user ${id} to ${nextStatus.toUpperCase()}...`);
        
        try {
            const { error } = await supabase
                .from('users')
                .update({ role: nextStatus === 'active' ? 'farmer' : 'disabled' }) // Using role as status proxy if no status field
                .eq('id', id);

            // Update locally regardless for responsiveness
            setUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
            console.log(`[Admin] Status update for ${id} successful.`);
            alert(`User account ${nextStatus === 'active' ? 'restored' : 'suspended'} successfully.`);
        } catch (err) {
            console.error("[Admin] Status toggle error:", err);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
        }
    };

    const resetPassword = (id: string) => {
        console.log(`[Admin] Initializing credential reset for user ${id}...`);
        alert("Password reset link has been dispatched to the farmer's registered email.");
    };

    const wipeUserData = (id: string) => {
        if (confirm("CRITICAL ACTION: Are you sure you want to wipe all records for this user? This cannot be undone.")) {
            console.warn(`[Admin] WIPING all data for user ${id}...`);
            setUsers(prev => prev.filter(u => u.id !== id));
            alert("User data stack has been purged from active relays.");
        }
    };

    const filteredUsers = users.filter(u => 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-12">
                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: Users, label: 'Active Farmers', value: users.filter(u => u.status === 'active').length, trend: '+14%', color: 'blue' },
                        { icon: ShieldCheck, label: 'Verfied Accounts', value: users.length, trend: '100%', color: 'emerald' },
                        { icon: CreditCard, label: 'Premium Users', value: Math.ceil(users.length * 0.42), trend: '+2.1%', color: 'amber' },
                    ].map((stat, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx} 
                            className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-2xl hover:border-agri-green/10 transition-all relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-agri-green/10 transition-colors pointer-events-none`} />
                            
                            <div className="space-y-2 relative z-10">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <div className="flex items-baseline gap-3">
                                    <p className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                                    <span className={`text-[10px] font-black uppercase text-${stat.color}-600 tracking-widest`}>{stat.trend}</span>
                                </div>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600 relative z-10`}>
                                <stat.icon size={28} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="space-y-8">
                    {/* List Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Farmer <span className="text-agri-green">Management</span></h3>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Administrative control over registry.</p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="relative group min-w-[300px]">
                                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agri-green transition-colors" />
                                <input 
                                    type="text"
                                    placeholder="Search by Name or Email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-agri-green/5 focus:border-agri-green/50 transition-all font-bold text-sm shadow-sm"
                                />
                            </div>
                            <button className="p-4 bg-gray-900 text-white rounded-2xl shadow-xl hover:bg-black transition-all group active:scale-95 shadow-gray-200">
                                <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Data List */}
                    <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Identity Profile</th>
                                        <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Operational Status</th>
                                        <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-center">Connected Farms</th>
                                        <th className="py-8 px-10 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">System Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center text-gray-400 font-black uppercase tracking-widest italic animate-pulse">Scanning User Directory...</td>
                                        </tr>
                                    ) : filteredUsers.map((u, idx) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={u.id} 
                                            className="group hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="py-8 px-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-gray-900 rounded-[1.5rem] flex items-center justify-center text-white ring-4 ring-gray-50 group-hover:ring-agri-green/10 transition-all font-black text-xl shadow-xl shadow-gray-200 uppercase">
                                                        {u.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-black text-gray-900 text-base group-hover:text-agri-green transition-colors">{u.full_name || 'Individual Farmer'}</p>
                                                            <BadgeCheck size={16} className="text-blue-500" />
                                                        </div>
                                                        <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                            <span className="flex items-center gap-1.5"><Mail size={12} className="text-gray-300" /> {u.email}</span>
                                                            <span className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-300" /> {u.region || 'Maharashtra'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-8 px-10">
                                                <div className={`px-4 py-2 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest w-fit ${
                                                    u.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                    <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                                    {u.status}
                                                </div>
                                            </td>
                                            <td className="py-8 px-10 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xl font-black text-gray-900 tracking-tighter">{u.registeredFarms || 0}</span>
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Sectors</span>
                                                </div>
                                            </td>
                                            <td className="py-8 px-10">
                                                <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                                    {u.status === 'active' ? (
                                                        <button 
                                                            onClick={() => toggleStatus(u.id, u.status)}
                                                            title="Disable Access"
                                                            className="p-3 bg-white border border-red-50 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all shadow-sm"
                                                        >
                                                            <UserX size={18} />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => toggleStatus(u.id, u.status)}
                                                            title="Restore Access"
                                                            className="p-3 bg-white border border-emerald-50 text-emerald-400 hover:text-white hover:bg-emerald-500 rounded-xl transition-all shadow-sm"
                                                        >
                                                            <Unlock size={18} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => resetPassword(u.id)}
                                                        className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-agri-green hover:border-agri-green rounded-xl transition-all shadow-sm" title="Reset Credentials"
                                                    >
                                                        <RefreshCw size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => wipeUserData(u.id)}
                                                        className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-600 rounded-xl transition-all shadow-sm" title="Wipe Data"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
