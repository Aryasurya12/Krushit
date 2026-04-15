'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname as useNextPathname, useRouter as useNextRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
    LayoutDashboard, 
    Monitor, 
    Cpu, 
    Bug, 
    MessageSquare, 
    Users, 
    BarChart3, 
    Megaphone,
    LogOut,
    Menu,
    Bell,
    Search,
    ShieldCheck,
    ChevronRight,
    Globe
} from 'lucide-react';

interface AdminSidebarItemProps {
    item: any;
    isActive: boolean;
    sidebarOpen: boolean;
}

const AdminSidebarItem = ({ item, isActive, sidebarOpen }: AdminSidebarItemProps) => {
    return (
        <Link href={item.href} className="block mb-2 group">
            <div className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                isActive 
                ? 'bg-agri-green text-white shadow-lg shadow-agri-green/20' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}>
                {isActive && (
                    <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-agri-green to-emerald-500 z-0"
                    />
                )}
                <item.icon size={22} className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {sidebarOpen && (
                    <span className="relative z-10 font-bold text-sm tracking-wide">{item.label}</span>
                )}
                {isActive && sidebarOpen && (
                    <ChevronRight size={14} className="ml-auto relative z-10 opacity-50" />
                )}
            </div>
        </Link>
    );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const pathname = useNextPathname();
    const { user, profile, loading, signOut } = useAuth();
    const router = useNextRouter();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!loading) {
            const isDemoMode = localStorage.getItem('is_demo_mode') === 'true';
            
            if (!user && !isDemoMode) {
                router.push('/auth/login');
            } else {
                // Check role strictly
                const userRole = profile?.role || localStorage.getItem('user_role');
                const isUserAdmin = userRole === 'admin';
                
                if (!isUserAdmin && !isDemoMode) {
                    console.warn("Access denied to Admin HQ for role:", userRole);
                    router.push('/farmer-dashboard');
                }
            }
        }
    }, [user, profile, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-agri-green/20 border-t-agri-green rounded-full"
                />
            </div>
        );
    }

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', href: '/admin-dashboard' },
        { icon: Monitor, label: 'Farm Monitoring', href: '/admin-dashboard/farms' },
        { icon: Cpu, label: 'IoT Devices', href: '/admin-dashboard/iot' },
        { icon: Bug, label: 'Disease Intelligence', href: '/admin-dashboard/diseases' },
        { icon: MessageSquare, label: 'Complaints', href: '/admin-dashboard/complaints' },
        { icon: Users, label: 'User Management', href: '/admin-dashboard/users' },
        { icon: BarChart3, label: 'System Analytics', href: '/admin-dashboard/analytics' },
        { icon: Megaphone, label: 'Broadcast', href: '/admin-dashboard/broadcast' },
    ];

    const currentItem = navItems.find(item => item.href === pathname) || navItems[0];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex selection:bg-agri-green selection:text-white">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-[#0F172A] border-r border-white/5 transition-all duration-500 ease-in-out ${
                sidebarOpen ? 'w-72' : 'w-24'
            }`}>
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="p-8 mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-agri-green rounded-2xl flex items-center justify-center text-white shadow-xl shadow-agri-green/20 shrink-0">
                                <ShieldCheck size={24} />
                            </div>
                            {sidebarOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="leading-tight"
                                >
                                    <h1 className="text-white font-black text-lg tracking-tighter uppercase">Krushit</h1>
                                    <p className="text-[10px] font-black text-agri-green tracking-[0.2em] uppercase opacity-70">Admin HQ</p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
                        <div className={`mb-4 px-4 ${sidebarOpen ? '' : 'text-center'}`}>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Main Modules</p>
                        </div>
                        {navItems.map((item, idx) => (
                            <AdminSidebarItem 
                                key={idx} 
                                item={item} 
                                isActive={pathname === item.href} 
                                sidebarOpen={sidebarOpen}
                            />
                        ))}
                    </nav>

                    {/* Footer Info */}
                    <div className="p-6 border-t border-white/5 bg-black/20">
                        {sidebarOpen && (
                            <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-agri-green animate-pulse" />
                                    <span className="text-[10px] font-black text-white uppercase">System Active</span>
                                </div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Uptime: 99.98%</div>
                            </div>
                        )}
                        <button 
                            onClick={() => {
                                localStorage.removeItem('is_demo_mode');
                                signOut();
                            }}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group"
                        >
                            <LogOut size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                            {sidebarOpen && <span className="font-black text-sm uppercase tracking-widest">Secure Exit</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${
                sidebarOpen ? 'ml-72' : 'ml-24'
            }`}>
                {/* Header */}
                <header className={`sticky top-0 z-40 transition-all duration-300 px-8 h-20 flex items-center justify-between ${
                    scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm' : 'bg-transparent'
                }`}>
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-agri-green hover:shadow-lg transition-all"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="hidden md:flex items-center gap-3">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Command</span>
                            <ChevronRight size={14} className="text-gray-300" />
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">{currentItem.label}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search */}
                        <div className="hidden lg:flex items-center bg-white border border-gray-100 rounded-2xl px-4 py-2 w-72 focus-within:ring-2 focus-within:ring-agri-green/20 transition-all shadow-sm">
                            <Search size={16} className="text-gray-400 mr-3" />
                            <input type="text" placeholder="Global Search..." className="bg-transparent border-none outline-none text-xs font-bold w-full text-gray-700" />
                        </div>

                        {/* Notifications */}
                        <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-agri-green hover:shadow-lg transition-all relative group">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20 group-hover:scale-125 transition-transform" />
                        </button>

                        <div className="h-10 w-px bg-gray-100" />

                        {/* Admin Profile */}
                        <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-gray-900 leading-none mb-1 uppercase tracking-wider">{user?.email?.split('@')[0] || 'Admin'}</p>
                                <div className="flex items-center justify-end gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-agri-green" />
                                    <p className="text-[9px] font-black text-agri-green uppercase tracking-tighter">Root Admin</p>
                                </div>
                            </div>
                            <div className="w-11 h-11 bg-[#0F172A] rounded-2xl flex items-center justify-center font-black text-white shadow-xl shadow-gray-200 group-hover:scale-105 transition-all">
                                {user?.email?.charAt(0).toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
