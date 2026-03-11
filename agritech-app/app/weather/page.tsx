'use client';

import { motion } from 'framer-motion';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { useTranslation } from 'react-i18next';
import { CloudSun, CloudRain, Sun, Wind, Droplets, Thermometer, Calendar, Clock, CheckCircle, AlertCircle, RefreshCw, ChevronRight, Zap, FlaskConical, Bug, ShieldCheck, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cropsApi } from '@/lib/api';



export default function WeatherPage() {
    const { t } = useTranslation();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [weatherData, setWeatherData] = useState({
        temp: 28,
        humidity: 45,
        wind: 12,
        status: 'Sunny',
        feelsLike: 30,
        rainProb: 10,
        condition: 'good'
    });
    const [forecast, setForecast] = useState([
        { day: 'Mon', icon: Sun, temp: 32, rain: 10, status: 'sunny' },
        { day: 'Tue', icon: CloudSun, temp: 30, rain: 20, status: 'cloudy' },
        { day: 'Wed', icon: CloudRain, temp: 28, rain: 80, status: 'rainy' },
        { day: 'Thu', icon: CloudRain, temp: 27, rain: 70, status: 'rainy' },
        { day: 'Fri', icon: CloudSun, temp: 29, rain: 30, status: 'partlyCloudy' },
        { day: 'Sat', icon: Sun, temp: 31, rain: 15, status: 'sunny' },
        { day: 'Sun', icon: Sun, temp: 33, rain: 5, status: 'sunny' },
    ]);
    const [crops, setCrops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Weather Fetching Logic (Mocking real API integration)
    useEffect(() => {
        const fetchWeather = async () => {
            // In a real app, you would use:
            // const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Mumbai&appid=YOUR_API_KEY`);
            // For now, we simulate real-time updates every 30 mins
            console.log("Fetching real-time weather data...");
            // Simulate slight fluctuations
            setWeatherData(prev => ({
                ...prev,
                temp: 28 + Math.floor(Math.random() * 3),
                humidity: 45 + Math.floor(Math.random() * 5),
                wind: 12 + Math.floor(Math.random() * 4)
            }));
        };

        const fetchCrops = async () => {
            try {
                const data = await cropsApi.getAll();
                setCrops(data || []);
            } catch (err) {
                console.error("Failed to fetch crops:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
        fetchCrops();

        const timer = setInterval(() => {
            setCurrentTime(new Date());
            fetchWeather();
        }, 30 * 60 * 1000); // 30 minutes

        return () => clearInterval(timer);
    }, []);

    // Cross-Referencing Logic for Schedule
    const getScheduledTasks = () => {
        const rainNext24h = forecast[1].rain > 50 || forecast[2].rain > 50;
        const windHigh = weatherData.wind > 15;
        const tempHigh = weatherData.temp > 32;

        const tasks = [
            {
                date: 'March 12',
                type: 'Irrigation',
                title: 'Irrigation Window',
                time: rainNext24h ? 'Postponed' : '6:00 AM',
                desc: rainNext24h ? 'Rain forecast detected. Irrigation paused.' : 'Optimized early morning window.',
                status: rainNext24h ? 'alert' : 'ongoing'
            },
            {
                date: 'March 14',
                type: 'Fertilizer',
                title: 'Fertilizer Application',
                time: '8:30 AM',
                desc: rainNext24h ? 'Delay recommended due to potential runoff.' : 'Apply Nitrogen (40 kg/acre).',
                status: rainNext24h ? 'warning' : 'scheduled'
            },
            {
                date: 'March 18',
                type: 'Pesticide',
                title: 'Pesticide Spray',
                time: windHigh ? 'Not Suitable' : 'Conditions suitable',
                desc: windHigh ? 'High wind speed detected. Risk of drift.' : 'Ideal weather for uniform application.',
                status: windHigh ? 'danger' : 'suitable'
            }
        ];
        return tasks;
    };

    const scheduledTasks = getScheduledTasks();

    // Spraying Conditions Logic
    const isSprayingSuitable = weatherData.wind < 15 && weatherData.humidity < 70 && weatherData.rainProb < 20;

    // Optimal Irrigation Windows
    const irrigationWindows = [
        { time: '5:30 AM – 7:30 AM', efficiency: '95%', label: 'Best (Early Morning)', color: 'text-green-600', active: true },
        { time: '6:00 PM – 8:00 PM', efficiency: '88%', label: 'Good (Evening)', color: 'text-blue-600', active: false },
        { time: '11:00 AM – 4:00 PM', efficiency: '42%', label: 'Avoid (Peak Heat)', color: 'text-red-500', active: false }
    ];

    return (
        <FarmerDashboardLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('nav.weather')}</h1>
                    <p className="text-sm text-gray-500">{t('weather.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.location.reload()} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-agri-green transition-all shadow-sm">
                        <RefreshCw size={18} />
                    </button>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 px-5 py-3 rounded-2xl shadow-sm">
                        <Calendar size={18} className="text-agri-green" /> 
                        {currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        <span className="text-gray-300 mx-1">|</span>
                        <Clock size={18} className="text-agri-green" />
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
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
                            <p className="text-xl font-bold">{weatherData.humidity}%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <p className="text-xs uppercase font-bold opacity-70 mb-1">{t('weather.wind')}</p>
                            <p className="text-xl font-bold">{weatherData.wind} km/h</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <p className="text-xs uppercase font-bold opacity-70 mb-1">{t('weather.feelsLike')}</p>
                            <p className="text-xl font-bold">{weatherData.temp + 2}°C</p>
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

            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-blue-100 mb-16">
                <div className="flex-shrink-0 w-20 h-20 bg-white/10 backdrop-blur-md text-white rounded-[2rem] flex items-center justify-center border border-white/20">
                    <CloudRain size={40} className="animate-bounce" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-2xl font-black text-white mb-2">{forecast[2].day} Night Alert: High Rain Probability</h4>
                    <p className="text-blue-100 text-lg font-medium">80% chance of heavy precipitation. We recommend securing loose irrigation equipment and postponing fertilizer application.</p>
                </div>
                <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-50 transition-all active:scale-95 whitespace-nowrap">
                    Plan for Rain
                </button>
            </div>

            {/* --- New Weather-Integrated Action Calendar --- */}
            <div className="space-y-12 mb-16">
                
                {/* 1. Smart Farming Action Calendar */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-agri-green text-white rounded-xl shadow-md">
                            <Calendar size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Smart Farming Action Calendar</h2>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 p-6 md:p-10 space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
                            {/* Connected Line (Desktop) */}
                            <div className="absolute left-0 right-0 top-[28px] h-0.5 bg-gray-100 hidden lg:block" />
                            
                            {scheduledTasks.map((task, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="relative z-10 space-y-4"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg mx-auto lg:mx-0 ${
                                        task.status === 'alert' ? 'bg-red-500 text-white' : 
                                        task.status === 'warning' ? 'bg-amber-500 text-white' : 'bg-agri-green text-white'
                                    }`}>
                                        {task.type === 'Irrigation' ? <Droplets size={28} /> : 
                                         task.type === 'Fertilizer' ? <FlaskConical size={28} /> : <Bug size={28} />}
                                    </div>
                                    <div className="text-center lg:text-left">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{task.date}</p>
                                        <h4 className="text-xl font-black text-gray-900 mb-1">{task.title}</h4>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-3 ${
                                            task.status === 'alert' ? 'bg-red-50 border-red-100 text-red-600' : 
                                            task.status === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-green-50 border-green-100 text-agri-green'
                                        }`}>
                                            <Clock size={12} /> {task.time}
                                        </div>
                                        <p className="text-sm font-medium text-gray-500 leading-relaxed">{task.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                                    <Zap size={24} />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h5 className="font-bold text-gray-900">Automatic Rescheduling System</h5>
                                    <p className="text-xs text-blue-700">Events are adjusted in real-time based on high rain and wind forecasts.</p>
                                </div>
                            </div>
                            <span className="px-4 py-2 bg-white text-blue-600 rounded-xl text-xs font-black uppercase border border-blue-200 shadow-sm animate-pulse">Syncing with Forecast...</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* 2. Daily Spray Recommendations */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                                <ShieldCheck size={24} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Daily Spray Reminder</h2>
                        </div>
                        
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Bug size={100} />
                            </div>
                            
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${isSprayingSuitable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                        <span className={`text-sm font-black uppercase tracking-widest ${isSprayingSuitable ? 'text-green-600' : 'text-red-500'}`}>
                                            Spraying {isSprayingSuitable ? 'Suitable' : 'Not Advised'}
                                        </span>
                                    </div>
                                    <div className="text-xs font-bold text-gray-400">Next update: 30 mins</div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold border-b border-gray-50 pb-4">
                                        <span className="text-gray-500 flex items-center gap-2"><Wind size={16} /> Wind Speed</span>
                                        <span className={weatherData.wind < 15 ? 'text-agri-green' : 'text-red-500'}>{weatherData.wind} km/h (Limit &lt; 15)</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold border-b border-gray-50 pb-4">
                                        <span className="text-gray-500 flex items-center gap-2"><Droplets size={16} /> Humidity</span>
                                        <span className={weatherData.humidity < 70 ? 'text-agri-green' : 'text-red-500'}>{weatherData.humidity}% (Limit &lt; 70)</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold border-b border-gray-50 pb-4">
                                        <span className="text-gray-500 flex items-center gap-2"><CloudRain size={16} /> Rain Chance</span>
                                        <span className={weatherData.rainProb < 20 ? 'text-agri-green' : 'text-red-500'}>{weatherData.rainProb}% (Limit &lt; 20)</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button 
                                        disabled={!isSprayingSuitable}
                                        className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all ${
                                            isSprayingSuitable 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700' 
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <ShieldCheck size={20} /> Verify & Push Notification
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Optimal Irrigation Windows */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md">
                                <Clock size={24} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Optimal Irrigation Windows</h2>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8 space-y-6">
                            <p className="text-sm font-bold text-gray-500">Based on data from {t('weather.currentLocation')}, here are the most efficient windows to reduce evaporation and heat stress.</p>
                            
                            <div className="space-y-4">
                                {irrigationWindows.map((window, i) => (
                                    <div 
                                        key={i} 
                                        className={`p-5 rounded-3xl border transition-all flex items-center justify-between ${
                                            window.active ? 'bg-green-50/50 border-green-200' : 'bg-gray-50 border-gray-100 opacity-60'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${window.active ? 'bg-green-100 text-agri-green' : 'bg-white text-gray-300'}`}>
                                                <Clock size={24} />
                                            </div>
                                            <div>
                                                <h5 className="text-lg font-black text-gray-900">{window.time}</h5>
                                                <p className={`text-xs font-black uppercase tracking-widest ${window.color}`}>{window.label}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Efficiency</p>
                                            <p className={`text-xl font-black ${window.color}`}>{window.efficiency}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Weekly Fertilizer Roadmap */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-md">
                            <FlaskConical size={24} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Weekly Fertilizer Roadmap</h2>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8 md:p-10">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { week: 'Week 1', task: 'Soil Preparation', status: 'Completed', color: 'text-gray-400', bg: 'bg-gray-50' },
                                { week: 'Week 2', task: 'Nitrogen Supplement', status: 'Active (March 14)', color: 'text-purple-600', bg: 'bg-purple-50' },
                                { week: 'Week 3', task: 'Calcium & Boron', status: 'Upcoming', color: 'text-gray-900', bg: 'bg-gray-50' },
                                { week: 'Week 4', task: 'Potassium Boost', status: 'Planning', color: 'text-gray-900', bg: 'bg-gray-50' }
                            ].map((w, i) => (
                                <div key={i} className={`p-6 rounded-[2rem] border border-gray-50 space-y-4 ${w.bg}`}>
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{w.week}</span>
                                        {w.status === 'Completed' && <CheckCircle size={16} className="text-agri-green" />}
                                    </div>
                                    <div>
                                        <h5 className={`text-lg font-black ${w.color}`}>{w.task}</h5>
                                        <p className="text-xs font-bold text-gray-500 mt-1">{w.status}</p>
                                    </div>
                                    {w.status.includes('Active') && (
                                        <div className="h-1 bg-purple-200 rounded-full overflow-hidden">
                                            <div className="h-full w-2/3 bg-purple-600" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                                    <AlertCircle size={24} />
                                </div>
                                <p className="text-sm font-medium text-gray-500 max-w-lg">
                                    Roadmap adapts to **Wheat** vegetative stage and current soil nutrient data. Next fertilizer window is dependent on Monday's rain forecast.
                                </p>
                            </div>
                            <button className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-black shadow-lg hover:bg-black transition-all">
                                Adjust Protocols
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </FarmerDashboardLayout>
    );
}
