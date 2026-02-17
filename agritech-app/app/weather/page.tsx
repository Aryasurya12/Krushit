'use client';

import { motion } from 'framer-motion';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { useTranslation } from 'react-i18next';
import { CloudSun, CloudRain, Sun, Wind, Droplets, Thermometer, Calendar } from 'lucide-react';



export default function WeatherPage() {
    const { t } = useTranslation();

    const forecast = [
        { day: 'Mon', icon: Sun, temp: 32, rain: 10, status: 'sunny' },
        { day: 'Tue', icon: CloudSun, temp: 30, rain: 20, status: 'cloudy' },
        { day: 'Wed', icon: CloudRain, temp: 28, rain: 80, status: 'rainy' },
        { day: 'Thu', icon: CloudRain, temp: 27, rain: 70, status: 'rainy' },
        { day: 'Fri', icon: CloudSun, temp: 29, rain: 30, status: 'partlyCloudy' },
        { day: 'Sat', icon: Sun, temp: 31, rain: 15, status: 'sunny' },
        { day: 'Sun', icon: Sun, temp: 33, rain: 5, status: 'sunny' },
    ];

    return (
        <FarmerDashboardLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('nav.weather')}</h1>
                    <p className="text-sm text-gray-500">{t('weather.subtitle')}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                    <Calendar size={16} /> Today, 15 Feb
                </div>
            </div>

            {/* Main Weather Hero */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Current Weather - Big Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[280px]">
                    <div className="absolute top-0 right-0 p-10 opacity-20">
                        <Sun size={200} className="animate-[spin_10s_linear_infinite]" />
                    </div>

                    <div className="relative z-10">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                            {t('weather.currentLocation')}
                        </span>
                        <div className="flex items-end gap-4 mb-2">
                            <h2 className="text-6xl md:text-8xl font-bold">28°</h2>
                            <span className="text-3xl md:text-4xl font-medium mb-2 opacity-80">C</span>
                        </div>
                        <p className="text-xl md:text-2xl font-medium opacity-90">{t('weather.sunny')} & Clear Sky</p>
                    </div>

                    <div className="relative z-10 grid grid-cols-3 gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <p className="text-xs uppercase font-bold opacity-70 mb-1">{t('weather.humidity')}</p>
                            <p className="text-xl font-bold">45%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <p className="text-xs uppercase font-bold opacity-70 mb-1">{t('weather.wind')}</p>
                            <p className="text-xl font-bold">12 km/h</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <p className="text-xs uppercase font-bold opacity-70 mb-1">{t('weather.feelsLike')}</p>
                            <p className="text-xl font-bold">30°C</p>
                        </div>
                    </div>
                </div>

                {/* Farming Insights */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t('weather.farmingConditions')}</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600"><Droplets size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">{t('weather.soilMoisture')}</p>
                                    <p className="text-sm font-bold text-gray-900">{t('weather.optimal')}</p>
                                </div>
                            </div>
                            <span className="text-green-600 text-xs font-bold bg-white px-2 py-1 rounded shadow-sm">{t('weather.good')}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Thermometer size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">{t('weather.heatStress')}</p>
                                    <p className="text-sm font-bold text-gray-900">{t('weather.moderate')}</p>
                                </div>
                            </div>
                            <span className="text-amber-600 text-xs font-bold bg-white px-2 py-1 rounded shadow-sm">{t('weather.warning')}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Wind size={20} /></div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">{t('weather.spraying')}</p>
                                    <p className="text-sm font-bold text-gray-900">{t('weather.suitable')}</p>
                                </div>
                            </div>
                            <span className="text-blue-600 text-xs font-bold bg-white px-2 py-1 rounded shadow-sm">{t('weather.ok')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('weather.forecast')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                    {forecast.map((day, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center flex flex-col items-center hover:shadow-md transition-shadow group"
                        >
                            <p className="text-xs font-bold text-gray-400 mb-2 uppercase">{day.day}</p>
                            <div className="mb-3 text-gray-400 group-hover:text-amber-500 transition-colors">
                                <day.icon size={32} />
                            </div>
                            <p className="text-xl font-bold text-gray-900 mb-1">{day.temp}°</p>
                            <div className="flex items-center gap-1 text-xs font-medium text-blue-500">
                                <Droplets size={10} /> {day.rain}%
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Advisory */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <CloudRain size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-lg font-bold text-blue-900 mb-2">{t('weather.alertTitle')}</h4>
                    <p className="text-blue-700">{t('weather.alertDesc')}</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap">
                    {t('weather.viewImpact')}
                </button>
            </div>
        </FarmerDashboardLayout>
    );
}
