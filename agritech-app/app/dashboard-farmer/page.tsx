'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Sprout, Droplets, AlertTriangle, Activity, CloudSun, Wind, CloudRain, CheckCircle, ThermometerSun, Leaf, Camera, Plus, Map, CheckCircle2, Circle, MapPin } from 'lucide-react';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

export default function FarmerHomePage() {
    const { t } = useTranslation();
    const { addNotification, notifications } = useNotifications();

    useEffect(() => {
        // Only trigger initial alerts if we have no notifications yet
        if (notifications.length === 0) {
            const initialAlerts = [
                { title: t('dashboard.home.highTempRisk'), message: t('dashboard.home.wheatRisk'), type: 'weather' as const },
                { title: t('dashboard.home.soilMoistureLow'), message: t('dashboard.home.tomatoIrrigation'), type: 'sensor' as const },
                { title: t('dashboard.home.diseaseRisk'), message: t('dashboard.home.riceBlast'), type: 'ai' as const },
            ];

            initialAlerts.forEach((alert, index) => {
                setTimeout(() => {
                    addNotification(alert.title, alert.message, alert.type);
                }, (index + 1) * 2000);
            });
        }
    }, [notifications.length, addNotification, t]);

    // Stats
    const summaryStats = [
        { title: t('dashboard.home.totalCrops'), value: `4 ${t('crop_data.days')}`, icon: Sprout, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: t('dashboard.home.totalArea'), value: '8 acres', icon: Map, color: 'text-purple-600', bg: 'bg-purple-100' },
        { title: t('dashboard.home.healthyCrops'), value: '3', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
        { title: t('dashboard.home.atRiskCrops'), value: '1', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
    ];

    // Farm Health Overview
    const cropHealth = [
        { name: t('crop_data.wheat'), health: 92, risk: t('community.low') },
        { name: 'Tomato', health: 75, risk: t('community.moderate') },
        { name: t('crop_data.rice'), health: 88, risk: t('community.low') },
    ];

    // Weather Data & Dynamic Tasks
    const [weather, setWeather] = useState({
        temp: '--°C',
        rain: '--%',
        wind: '-- km/h',
        condition: t('weather.sunny') || 'Loading...',
        advice: 'Fetching smart advice...'
    });

    const [tasks, setTasks] = useState([
        { id: 1, title: t('dashboard.home.irrigateWheat'), time: '4:00 PM', done: false },
        { id: 2, title: t('dashboard.home.applyFertilizer'), time: t('nav.todayAdvice'), done: false },
        { id: 3, title: t('dashboard.home.inspectLeaves'), time: t('nav.todayAdvice'), done: true },
    ]);

    useEffect(() => {
        async function fetchSmartData() {
            try {
                // Fetch real-time weather data
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&current=temperature_2m,wind_speed_10m,weather_code&hourly=precipitation_probability');
                const data = await res.json();
                
                const temp = data.current.temperature_2m;
                const wind = data.current.wind_speed_10m;
                const rainProb = data.hourly?.precipitation_probability?.[0] || 0;
                const code = data.current.weather_code;

                let conditionStr = 'Sunny';
                if (code >= 1 && code <= 3) conditionStr = 'Partly Cloudy';
                if (code >= 51 && code <= 67) conditionStr = 'Rainy';
                if (code >= 71 && code <= 77) conditionStr = 'Snowy';
                if (code >= 95) conditionStr = 'Thunderstorm';

                let advice = 'Conditions are optimal for farming today.';
                if (rainProb > 50) advice = 'High chance of rain. Avoid irrigation today.';
                else if (temp > 30) advice = 'High temperature expected. Irrigate in the evening.';
                else if (wind > 20) advice = 'Strong winds expected. Avoid spraying pesticides.';

                setWeather({
                    temp: `${temp}°C`,
                    rain: `${rainProb}%`,
                    wind: `${wind} km/h`,
                    condition: conditionStr,
                    advice: advice
                });

                // Generate Tasks Dynamically based on rules
                const generatedTasks = [];
                let idCount = 1;

                if (temp > 30) {
                    generatedTasks.push({ id: idCount++, title: 'Irrigate crops in evening', time: '6:00 PM', done: false });
                }
                
                if (rainProb > 50) {
                    generatedTasks.push({ id: idCount++, title: 'Avoid irrigation today', time: 'All Day', done: false });
                }
                
                const hasLowHealth = cropHealth.some(c => c.health < 80);
                if (hasLowHealth) {
                    generatedTasks.push({ id: idCount++, title: 'Inspect crops for disease', time: 'Morning', done: false });
                }
                
                const soilMoisture = 25; // mock low moisture
                if (soilMoisture < 30) {
                    generatedTasks.push({ id: idCount++, title: 'Check irrigation system', time: 'ASAP', done: false });
                }

                if (generatedTasks.length === 0) {
                    generatedTasks.push({ id: idCount++, title: t('dashboard.home.inspectLeaves') || 'Inspect crops', time: 'Today', done: false });
                }

                setTasks(generatedTasks);
            } catch (error) {
                console.error("Failed to fetch smart data:", error);
            }
        }
        fetchSmartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Urgent Alerts
    const alerts = [
        { title: t('dashboard.home.highTempRisk'), crop: t('crop_data.wheat'), type: 'danger', farm: 'Farm 2' },
        { title: t('dashboard.home.soilMoistureLow'), crop: 'Tomato', type: 'warning', farm: 'North Plot', zone: 'Zone A' },
        { title: t('dashboard.home.diseaseRisk'), crop: t('crop_data.rice'), type: 'warning', farm: 'Farm 1' },
    ];

    // Today's Tasks
    // Replaced by dynamic tasks block

    // Recent Activity
    const activities = [
        { action: t('dashboard.home.scannedCrop') + ' Tomato', time: '2 hours ago' },
        { action: t('dashboard.home.addedNewCrop') + ': ' + t('crop_data.wheat'), time: '1 day ago' },
        { action: t('dashboard.home.updatedIrrigation'), time: '2 days ago' },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const StatCard = ({ title, value, color, bg, icon: Icon }: any) => (
        <motion.div whileHover={{ y: -4 }} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${bg}`}>
                    <Icon size={20} className={color} />
                </div>
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
        </motion.div>
    );

    return (
        <FarmerDashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('dashboard.home.center')}</h1>
                    <p className="text-sm text-gray-500">{t('dashboard.home.overview')}</p>
                </div>
            </div>

            {/* Top Row: Farm Health Score & Weather */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Farm Health Score (1/3 width) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-agri-dark to-black p-6 rounded-xl text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Activity size={100} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wide mb-2">{t('dashboard.home.healthScore')}</h3>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-5xl font-extrabold text-white">87</span>
                            <span className="text-xl text-gray-300">/ 100</span>
                        </div>
                        <p className="text-sm text-gray-300 font-medium">{t('dashboard.home.healthGood')}<br />{t('dashboard.home.healthNeedAttention')}</p>
                    </div>
                </motion.div>

                {/* Weather Card (2/3 width) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-xl shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="p-3 bg-blue-500 rounded-full text-white shadow-md">
                            <CloudSun size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{t('dashboard.home.weatherToday')}</h3>
                            <p className="text-sm text-blue-800 font-bold uppercase tracking-wide">{weather.condition}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 mb-5">
                        <div className="flex items-center gap-3">
                            <ThermometerSun className="text-amber-500" size={24} />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('dashboard.home.temp')}</p>
                                <p className="text-lg font-extrabold text-gray-900">{weather.temp}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CloudRain className="text-blue-500" size={24} />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('dashboard.home.rain')}</p>
                                <p className="text-lg font-extrabold text-gray-900">{weather.rain}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Wind className="text-gray-500" size={24} />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('dashboard.home.wind')}</p>
                                <p className="text-lg font-extrabold text-gray-900">{weather.wind}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/70 p-3 rounded-lg border border-white flex items-start gap-2 shadow-sm">
                        <Leaf className="text-agri-green mt-0.5" size={18} />
                        <span className="text-sm font-bold text-gray-800">{t('dashboard.home.advice')}: <span className="font-semibold text-gray-700">{weather.advice}</span></span>
                    </div>
                </motion.div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {summaryStats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                        <StatCard {...stat} />
                    </motion.div>
                ))}
            </div>

            {/* Farm Health & Urgent Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Farm Health Overview */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="text-agri-green" size={20} /> {t('dashboard.home.healthOverview')}
                        </h3>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/30 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="p-4">{t('community.cropAffected')}</th>
                                    <th className="p-4">{t('dashboard.home.healthScore')}</th>
                                    <th className="p-4">{t('community.diseaseName')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cropHealth.map((item, i) => (
                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group">
                                        <td className="p-4 text-sm font-bold text-gray-900 group-hover:text-agri-green flex items-center gap-2 transition-colors">
                                            <Sprout size={16} className="text-gray-400 group-hover:text-agri-green transition-colors" /> {item.name}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-agri-green" style={{ width: `${item.health}%` }}></div>
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">{item.health}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${item.risk === t('community.low') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                {item.risk}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-3 border-t border-gray-50 bg-gray-50/30 text-center">
                        <Link href="/crops" className="text-sm font-bold text-agri-green hover:underline">{t('dashboard.home.viewAllCrops')} →</Link>
                    </div>
                </motion.div>

                {/* Urgent Alerts */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-red-50/30">
                        <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                            <AlertTriangle className="text-red-500" size={20} /> {t('dashboard.home.urgentAlerts')}
                        </h3>
                    </div>
                    <div className="p-5 space-y-4 flex-1">
                        {alerts.map((alert, i) => (
                            <div key={i} className={`p-4 rounded-xl border flex items-start gap-4 transition-all hover:-translate-y-1 hover:shadow-sm ${alert.type === 'danger' ? 'bg-red-50/50 border-red-100' : 'bg-amber-50/50 border-amber-100'}`}>
                                <div className={`p-2 rounded-xl mt-0.5 ${alert.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                    <AlertTriangle size={18} />
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold mb-1 ${alert.type === 'danger' ? 'text-red-900' : 'text-amber-900'}`}>{alert.title}</h4>
                                    <div className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-tight mb-0.5 ${alert.type === 'danger' ? 'text-red-600' : 'text-amber-600'}`}>
                                        <MapPin size={10} />
                                        <span>{alert.crop} — {(alert as any).farm}</span>
                                        {(alert as any).zone && (
                                            <>
                                                <span className="mx-1 opacity-50">•</span>
                                                <span>{(alert as any).zone}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Tasks, Actions, and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Today's Tasks */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-xl border border-gray-100 shadow-sm col-span-1 flex flex-col">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><CheckCircle size={20} className="text-agri-green" /> {t('dashboard.home.todayTasks')}</h3>
                    </div>
                    <div className="p-3 flex-1">
                        {tasks.map((task) => (
                            <div key={task.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer group transition-colors">
                                <div className="text-gray-300 group-hover:text-agri-green transition-colors">
                                    {task.done ? <CheckCircle2 size={22} className="text-agri-green" /> : <Circle size={22} />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-bold transition-colors ${task.done ? 'text-gray-400 line-through' : 'text-gray-900 group-hover:text-agri-green'}`}>{task.title}</p>
                                    <p className="text-xs text-gray-500 font-semibold">{task.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Activity size={20} className="text-agri-green" /> {t('dashboard.home.quickActions')}</h3>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4 flex-1 content-center">
                        <Link href="/disease" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:text-green-700 border border-transparent hover:border-green-200 transition-all gap-3 text-center group shadow-sm hover:shadow">
                            <div className="p-3 bg-white rounded-xl shadow-xs border border-gray-100 group-hover:bg-green-100 group-hover:text-green-600 group-hover:border-green-200 text-gray-600 transition-colors">
                                <Camera size={22} />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-green-700">{t('dashboard.home.scanCrop')}</span>
                        </Link>
                        <Link href="/iot" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-200 transition-all gap-3 text-center group shadow-sm hover:shadow">
                            <div className="p-3 bg-white rounded-xl shadow-xs border border-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:border-blue-200 text-gray-600 transition-colors">
                                <Droplets size={22} />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">{t('dashboard.home.waterAdvice')}</span>
                        </Link>
                        <Link href="/crops" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-purple-50 hover:text-purple-700 border border-transparent hover:border-purple-200 transition-all gap-3 text-center group shadow-sm hover:shadow">
                            <div className="p-3 bg-white rounded-xl shadow-xs border border-gray-100 group-hover:bg-purple-100 group-hover:text-purple-600 group-hover:border-purple-200 text-gray-600 transition-colors">
                                <Plus size={22} />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-purple-700">{t('dashboard.home.addCrop')}</span>
                        </Link>
                        <Link href="/crops" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-amber-50 hover:text-amber-700 border border-transparent hover:border-amber-200 transition-all gap-3 text-center group shadow-sm hover:shadow">
                            <div className="p-3 bg-white rounded-xl shadow-xs border border-gray-100 group-hover:bg-amber-100 group-hover:text-amber-600 group-hover:border-amber-200 text-gray-600 transition-colors">
                                <Activity size={22} />
                            </div>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-amber-700">{t('dashboard.home.farmHealth')}</span>
                        </Link>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-900">{t('dashboard.home.recentActivity')}</h3>
                    </div>
                    <div className="p-6 flex-1">
                        <div className="relative border-l-2 border-gray-100 ml-3 space-y-7">
                            {activities.map((act, i) => (
                                <div key={i} className="pl-6 relative">
                                    <div className="absolute w-3.5 h-3.5 bg-agri-green rounded-full -left-[9px] top-0.5 ring-4 ring-white shadow-sm"></div>
                                    <p className="text-sm font-bold text-gray-800 mb-1">{act.action}</p>
                                    <p className="text-xs text-gray-500 font-bold tracking-wide uppercase">{act.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </FarmerDashboardLayout>
    );
}
