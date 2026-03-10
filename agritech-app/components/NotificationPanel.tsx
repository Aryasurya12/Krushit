'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Bell, 
    Trash2, 
    AlertTriangle, 
    CloudRain, 
    Droplets, 
    Zap, 
    Users, 
    Info, 
    CheckCircle 
} from 'lucide-react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationPanel() {
    const { 
        notifications, 
        isPanelOpen, 
        setIsPanelOpen, 
        markAllAsRead, 
        deleteNotification 
    } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case 'crop':
            case 'ai':
                return <AlertTriangle size={18} className="text-red-500" />;
            case 'weather':
                return <CloudRain size={18} className="text-blue-500" />;
            case 'water':
                return <Droplets size={18} className="text-emerald-500" />;
            case 'sensor':
                return <Zap size={18} className="text-amber-500" />;
            case 'community':
                return <Users size={18} className="text-purple-500" />;
            default:
                return <Info size={18} className="text-agri-green" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'crop':
            case 'ai':
                return 'bg-red-50';
            case 'weather':
                return 'bg-blue-50';
            case 'water':
                return 'bg-emerald-50';
            case 'sensor':
                return 'bg-amber-50';
            case 'community':
                return 'bg-purple-50';
            default:
                return 'bg-agri-green/5';
        }
    };

    return (
        <AnimatePresence>
            {isPanelOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsPanelOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60] lg:hidden"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed lg:absolute top-16 right-0 lg:right-4 w-full lg:w-[400px] h-[calc(100vh-64px)] lg:h-auto lg:max-h-[500px] bg-white lg:rounded-2xl shadow-2xl z-[70] border-t lg:border border-gray-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-agri-green/10 text-agri-green rounded-lg">
                                    <Bell size={18} />
                                </div>
                                <h3 className="font-bold text-gray-900">Notifications</h3>
                            </div>
                            <div className="flex items-center gap-1">
                                {notifications.length > 0 && (
                                    <button 
                                        onClick={() => markAllAsRead()}
                                        className="text-xs font-bold text-agri-green hover:bg-agri-green/5 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <CheckCircle size={14} /> Mark all read
                                    </button>
                                )}
                                <button 
                                    onClick={() => setIsPanelOpen(false)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-gray-50/30">
                            {notifications.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                        <Bell size={32} />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-1">All caught up!</h4>
                                    <p className="text-sm text-gray-500">No new notifications at the moment.</p>
                                </div>
                            ) : (
                                notifications.map((notification: Notification) => (
                                    <div 
                                        key={notification.id}
                                        className={`group relative p-3 rounded-xl transition-all duration-200 border border-transparent ${
                                            notification.is_read ? 'bg-white opacity-80' : 'bg-white shadow-sm border-gray-100'
                                        } hover:shadow-md hover:border-agri-green/20`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${getBgColor(notification.type)}`}>
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                                    <h4 className={`text-sm font-bold truncate ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.is_read && (
                                                        <span className="shrink-0 w-2 h-2 bg-red-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 leading-relaxed mb-1.5">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] font-medium text-gray-400">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 5 && (
                            <div className="p-3 border-t border-gray-50 text-center">
                                <button className="text-xs font-bold text-gray-500 hover:text-agri-green transition-colors">
                                    View all history
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
