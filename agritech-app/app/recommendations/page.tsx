'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { useTranslation } from 'react-i18next';
import { CheckCircle, AlertTriangle, Droplets, Sprout, Bug, Sun, ArrowRight, Activity, Filter, MapPin } from 'lucide-react';

export default function FarmHealthPage() {
    const { t } = useTranslation();
    const [filter, setFilter] = useState('all');
    const [completedTasks, setCompletedTasks] = useState<number[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);

    // Simulated live data context - in a real app this feeds from Supabase IoT / AI Backend
    const [liveData, setLiveData] = useState({
        temperature: 32,
        soilMoisture: 35, // Low moisture
        healthScore: 78,
        prevHealthScore: 85,
        diseaseDetected: true,
        diseaseType: 'Aphids',
        rainExpected: true,
        crop: 'Wheat',
        stage: 'Vegetative',
        location: 'North Plot'
    });

    // Trend Analysis Logic
    const healthDiff = liveData.healthScore - liveData.prevHealthScore;
    const trendStatus = healthDiff > 0 ? "Health improving" : healthDiff < 0 ? "Declining" : "Stable";
    const trendColor = healthDiff > 0 ? "text-green-600" : healthDiff < 0 ? "text-red-500" : "text-blue-500";

    // Engine: Generate alerts dynamically
    useEffect(() => {
        const generatedAlerts = [];
        let idCounter = 1;

        // 1. Water Requirement Alert
        if (liveData.temperature > 30 && liveData.soilMoisture < 40) {
            generatedAlerts.push({
                id: idCounter++,
                icon: Droplets,
                title: "Water Requirement Alert",
                description: `Temperature is ${liveData.temperature}°C with low soil moisture (${liveData.soilMoisture}%). Evaporation risk is extremely high.`,
                priority: "high",
                action: "Water your crop today",
                context: `${liveData.crop} needs hydration in ${liveData.stage} stage.`,
                category: "irrigation",
                farmName: liveData.location
            });
        }

        // 2. Pest/Disease Alert
        if (liveData.diseaseDetected) {
            generatedAlerts.push({
                id: idCounter++,
                icon: Bug,
                title: "Pest/Disease Risk Detected",
                description: `AI model detected early signs of ${liveData.diseaseType} spread in the current quadrant.`,
                priority: "high",
                action: `Apply organic pesticides for ${liveData.diseaseType}`,
                context: "Immediate intervention required to prevent yield loss.",
                category: "pest",
                farmName: liveData.location
            });
        }

        // 3. Nutrient Deficiency Alert
        if (liveData.healthScore < liveData.prevHealthScore) {
            generatedAlerts.push({
                id: idCounter++,
                icon: Sprout,
                title: "Nutrient Deficiency Alert",
                description: `Crop health trajectory has dropped by ${Math.abs(healthDiff)} points over the last 48 hours. Growth is stalling.`,
                priority: "medium",
                action: "Apply NPK fertilizer",
                context: "Soil sensors indicate nitrogen depletion.",
                category: "nutrition",
                farmName: liveData.location
            });
        }

        // 4. Weather Risk Alert
        if (liveData.rainExpected) {
            generatedAlerts.push({
                id: idCounter++,
                icon: Sun,
                title: "Weather Risk Alert",
                description: "Heavy rainfall is scheduled in your geographical sector within the next 24 hours.",
                priority: "low",
                action: "Avoid irrigation or spraying",
                context: "Prevents chemical runoff and root waterlogging.",
                category: "weather",
                farmName: liveData.location
            });
        }

        setAlerts(generatedAlerts);
    }, [liveData]);

    const activeRecommendations = alerts.filter(a => !completedTasks.includes(a.id));
    const highPriorityCount = activeRecommendations.filter(a => a.priority === 'high').length;
    const warningCount = activeRecommendations.filter(a => a.priority === 'medium').length;

    const filteredRecs = filter === 'all'
        ? activeRecommendations
        : activeRecommendations.filter(r => r.priority === filter);

    const handleExecute = (id: number) => {
        setCompletedTasks(prev => [...prev, id]);
        // Simulate health score bump when taking actions
        if (liveData.healthScore < 95) {
            setLiveData(prev => ({
                ...prev,
                healthScore: prev.healthScore + 2,
                prevHealthScore: prev.healthScore // Shift trend up
            }));
        }
    };

    return (
        <FarmerDashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('nav.farmHealth')}</h1>
                    <p className="text-sm text-gray-500">{t('recommendations.actionableInsights')}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-gray-700">{t('recommendations.healthScore')}: <span className="text-gray-900 font-bold">{liveData.healthScore}/100</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        <Activity size={12} className={trendColor} />
                        <span className={`text-xs font-bold uppercase tracking-wide ${trendColor}`}>{trendStatus}</span>
                    </div>
                </div>
            </div>

            {/* Health Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-full ${highPriorityCount > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{highPriorityCount}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase">{t('recommendations.criticalActions')}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-full ${warningCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{warningCount}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase">{t('recommendations.warnings')}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-full ${completedTasks.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase">{t('recommendations.completed')}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                <Filter size={16} className="text-gray-400" />
                {['all', 'high', 'medium', 'low'].map((p) => (
                    <button
                        key={p}
                        onClick={() => setFilter(p)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${filter === p
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        {p === 'all' ? t('crop.all') : t(`community.${p}`)}
                    </button>
                ))}
            </div>

            {/* Recommendations List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredRecs.map((rec) => (
                        <motion.div
                            key={rec.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                            className={`bg-white rounded-xl border shadow-sm p-6 group transition-all hover:shadow-md ${rec.priority === 'high' ? 'border-l-4 border-l-red-500' :
                                rec.priority === 'medium' ? 'border-l-4 border-l-amber-500' :
                                    'border-l-4 border-l-green-500'
                                } border-gray-100`}
                        >
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                {/* Icon container */}
                                <div className={`p-4 rounded-2xl shrink-0 ${rec.priority === 'high' ? 'bg-red-50 text-red-600' :
                                    rec.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                                        'bg-green-50 text-green-600'
                                    }`}>
                                    <rec.icon size={28} />
                                </div>

                                <div className="flex-1 w-full">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-lg font-bold text-gray-900">{rec.title}</h3>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                            rec.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {t(`community.${rec.priority}`)} Priority
                                        </span>
                                    </div>

                                    {/* Farm & Context Line */}
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-agri-green mb-3 uppercase tracking-tight">
                                        <MapPin size={14} className="shrink-0" />
                                        <span>{liveData.crop} — {(rec as any).farmName}</span>
                                    </div>

                                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{rec.description}</p>

                                    <div className="bg-gray-50 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xs shrink-0">
                                                ?
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase">{t('recommendations.recommendedAction')}</p>
                                                <p className="text-sm font-semibold text-gray-900">{rec.action}</p>
                                                <p className="text-xs text-blue-600 font-medium mt-0.5">{rec.context}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleExecute(rec.id)}
                                            className="w-full sm:w-auto px-5 py-2 min-w-[120px] bg-white border border-gray-200 text-gray-700 hover:text-agri-green hover:border-agri-green/50 hover:bg-green-50/50 font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 group-hover:translate-x-1 shadow-sm"
                                        >
                                            {t('recommendations.execute')} <CheckCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredRecs.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{t('recommendations.allClear')}</h3>
                        <p className="text-sm text-gray-500">{t('recommendations.noRecs')}</p>
                    </div>
                )}
            </div>
        </FarmerDashboardLayout>
    );
}
