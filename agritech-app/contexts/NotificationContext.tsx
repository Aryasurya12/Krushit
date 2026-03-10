'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Info, AlertTriangle, CloudRain, Droplets, Zap, Users } from 'lucide-react';

export type NotificationType = 'crop' | 'weather' | 'sensor' | 'ai' | 'water' | 'community' | 'general';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    is_read: boolean;
    created_at: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (title: string, message: string, type: NotificationType) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    isPanelOpen: boolean;
    setIsPanelOpen: (isOpen: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [toast, setToast] = useState<{ title: string; message: string; type: NotificationType } | null>(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        // Skip DB fetch for mock users (ID starts with 'mock-user-')
        if (user.id.startsWith('mock-user-') || user.id.startsWith('d3300000') || user.id.startsWith('r4800000')) {
            const localData = localStorage.getItem(`notifications_${user.id}`);
            if (localData) {
                setNotifications(JSON.parse(localData));
            }
            return;
        }

        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Database notifications fetch failed (expected if table missing):', error.message);
                // Fallback to local storage for any DB error
                const localData = localStorage.getItem(`notifications_${user.id}`);
                if (localData) {
                    setNotifications(JSON.parse(localData));
                }
                return;
            }

            setNotifications(data || []);
        } catch (error) {
            // Silently handle error to prevent Next.js error overlay
            console.warn('Silent catch: Notification fetch unavailable');
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Update localStorage when notifications change (fallback for RLS/missing table)
    useEffect(() => {
        if (user && notifications.length > 0) {
            localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
        }
    }, [notifications, user]);

    const addNotification = async (title: string, message: string, type: NotificationType) => {
        if (!user) return;

        const newNotification = {
            user_id: user.id,
            title,
            message,
            type,
            is_read: false,
            created_at: new Date().toISOString(),
        };

        // Show Toast
        setToast({ title, message, type });
        setTimeout(() => setToast(null), 5000);

        // Skip DB if mock user
        if (user.id.startsWith('mock-user-') || user.id.startsWith('d3300000') || user.id.startsWith('r4800000')) {
            const tempId = Math.random().toString(36).substr(2, 9);
            setNotifications(prev => [{ ...newNotification, id: tempId, is_read: false, created_at: new Date().toISOString() }, ...prev]);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('notifications')
                .insert([newNotification])
                .select();

            if (error) {
                const tempId = Math.random().toString(36).substr(2, 9);
                setNotifications(prev => [{ ...newNotification, id: tempId }, ...prev]);
                return;
            }

            if (data) {
                setNotifications(prev => [data[0], ...prev]);
            }
        } catch (error) {
            const tempId = Math.random().toString(36).substr(2, 9);
            setNotifications(prev => [{ ...newNotification, id: tempId }, ...prev]);
        }
    };

    const markAllAsRead = async () => {
        if (!user || notifications.filter(n => !n.is_read).length === 0) return;

        try {
            // Update local state immediately for responsiveness
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

            if (user.id.startsWith('mock-user-') || user.id.startsWith('d3300000') || user.id.startsWith('r4800000')) return;

            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) console.warn("Supabase markRead failed:", error.message);
        } catch (error) {
            console.warn('Silent catch: Notification update unavailable');
        }
    };

    const deleteNotification = async (id: string) => {
        if (!user) return;

        try {
            setNotifications(prev => prev.filter(n => n.id !== id));

            if (user.id.startsWith('mock-user-') || user.id.startsWith('d3300000') || user.id.startsWith('r4800000')) return;

            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) console.warn("Supabase delete failed:", error.message);
        } catch (error) {
            console.warn('Silent catch: Notification delete unavailable');
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAllAsRead,
            deleteNotification,
            isPanelOpen,
            setIsPanelOpen
        }}>
            {children}
            
            {/* Toast Notification Popup */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-20 right-4 z-[100] w-full max-w-sm"
                    >
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-4 flex items-start gap-4 ring-1 ring-black/5">
                            <div className={`p-2 rounded-xl shrink-0 ${
                                toast.type === 'crop' || toast.type === 'ai' ? 'bg-red-50 text-red-500' :
                                toast.type === 'weather' ? 'bg-blue-50 text-blue-500' :
                                toast.type === 'water' || toast.type === 'sensor' ? 'bg-emerald-50 text-emerald-500' :
                                'bg-agri-green/10 text-agri-green'
                            }`}>
                                {toast.type === 'crop' || toast.type === 'ai' ? <AlertTriangle size={20} /> :
                                 toast.type === 'weather' ? <CloudRain size={20} /> :
                                 toast.type === 'water' ? <Droplets size={20} /> :
                                 toast.type === 'sensor' ? <Zap size={20} /> :
                                 toast.type === 'community' ? <Users size={20} /> :
                                 <Info size={20} />}
                            </div>
                            <div className="flex-1 min-w-0 pr-4">
                                <h4 className="text-sm font-bold text-gray-900 mb-0.5">{toast.title}</h4>
                                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{toast.message}</p>
                            </div>
                            <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 p-1">
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
