'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft, Calendar, MapPin, Droplets, Thermometer,
    Wind, Activity, ShieldAlert, FileText, Camera, Droplet, Clock, Download, Leaf, Sprout, TrendingUp, AlertTriangle
} from 'lucide-react';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { CropGrowthAnimation } from '@/components/CropGrowthAnimation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Mock data (since no backend DB parameter logic yet)
const mockCropsData: Record<string, any> = {
    '1': { id: 1, name: 'Wheat', variety: 'HD-2967', area: '2 acres', planted: '2025-10-12', location: 'Village A, District X', soil_type: 'Alluvial Soil', irrigation_type: 'Canal Irrigation', progress: 65, stage: 'Vegetative', health_score: 92, water_req: 'Sufficient', risk: 'Low Risk' },
    '2': { id: 2, name: 'Rice', variety: 'Basmati', area: '1.5 acres', planted: '2025-11-15', location: 'Village B, District Y', soil_type: 'Black Soil', irrigation_type: 'Rainfed', progress: 80, stage: 'Flowering', health_score: 88, water_req: 'Moderate', risk: 'Medium Risk' },
    '3': { id: 3, name: 'Sugarcane', variety: 'Co-86032', area: '3 acres', planted: '2026-01-01', location: 'Village C, District Z', soil_type: 'Red Soil', irrigation_type: 'Drip Irrigation', progress: 45, stage: 'Vegetative', health_score: 65, water_req: 'Required', risk: 'High Risk' },
    '4': { id: 4, name: 'Cotton', variety: 'Bt Cotton', area: '2.5 acres', planted: '2025-12-20', location: 'Village D, District W', soil_type: 'Sandy Soil', irrigation_type: 'Sprinkler', progress: 70, stage: 'Flowering', health_score: 95, water_req: 'Sufficient', risk: 'Low Risk' }
};

const stages = ['Seed', 'Germination', 'Seedling', 'Vegetative', 'Flowering', 'Grain Formation', 'Harvest'];

export interface Crop {
    id: number;
    name: string;
    variety: string;
    area: string;
    planted: string;
    location: string;
    soil_type: string;
    irrigation_type: string;
    progress: number;
    stage: string;
    health_score: number;
    water_req: string;
    risk: string;
}

export default function CropDetailsDashboard() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const [crop, setCrop] = useState<Crop | null>(null);

    useEffect(() => {
        if (id && mockCropsData[id as string]) {
            setCrop(mockCropsData[id as string]);
        } else {
            // Default generic fallback
            setCrop({
                id: Number(id),
                name: 'Custom Crop',
                variety: 'Local',
                area: '1 acre',
                planted: new Date().toISOString().split('T')[0],
                location: 'Current GPS',
                soil_type: 'Local Soil',
                irrigation_type: 'Rainfed',
                progress: 50,
                stage: 'Vegetative',
                health_score: 85,
                water_req: 'Moderate',
                risk: 'Low Risk'
            });
        }
    }, [id]);

    if (!crop) return <FarmerDashboardLayout><div className="flex justify-center items-center h-full">Loading...</div></FarmerDashboardLayout>;

    // Calculate days since sowing
    const plantedDate = new Date(crop.planted);
    const today = new Date();
    const daysSinceSowing = Math.floor((today.getTime() - plantedDate.getTime()) / (1000 * 3600 * 24));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generateReport = () => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text(`Crop Report: ${crop?.name} (${crop?.variety})`, 14, 22);

        doc.setFontSize(12);
        doc.text(`Report Generated On: ${new Date().toLocaleDateString()}`, 14, 32);

        autoTable(doc, {
            startY: 40,
            head: [['Detail', 'Information']],
            body: [
                ['Crop Name', crop.name],
                ['Variety', crop.variety],
                ['Area', crop.area],
                ['Planted Date', crop.planted],
                ['Days Since Sowing', `${daysSinceSowing} days`],
                ['Farm Location', crop.location],
                ['Soil Type', crop.soil_type],
                ['Irrigation Type', crop.irrigation_type],
                ['Current Stage', crop.stage],
                ['Health Score', `${crop.health_score} / 100`],
                ['Water Requirement', crop.water_req],
                ['Risk Level', crop.risk]
            ],
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] } // Agri Green
        });

        doc.setFontSize(14);
        doc.text('Recent Health Timeline', 14, (doc as any).lastAutoTable.finalY + 15);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Date', 'Health Score', 'Disease Detected', 'Status']],
            body: [
                ['12 March', '88', 'None', 'Healthy'],
                ['18 March', '81', 'Leaf Rust', 'Needs Attention'],
                ['25 March', '90', 'Recovered', 'Healthy']
            ],
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] }
        });

        doc.save(`${crop.name}_Report_${new Date().getTime()}.pdf`);
    };

    return (
        <FarmerDashboardLayout>
            {/* Header & Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/crops')}
                        className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{crop.name} <span className="text-gray-400 font-medium text-lg">({crop.variety})</span></h1>
                        <p className="text-sm text-gray-500 font-medium capitalize mt-0.5">Crop Details Dashboard</p>
                    </div>
                </div>
                <button
                    onClick={generateReport}
                    className="flex items-center gap-2 bg-agri-green text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 transition-colors"
                >
                    <Download size={18} /> Generate Report
                </button>
            </div>

            {/* Crop Information Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Crop</p>
                        <p className="text-sm font-semibold text-gray-900">{crop.name}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Variety</p>
                        <p className="text-sm font-semibold text-gray-900">{crop.variety}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Area</p>
                        <p className="text-sm font-semibold text-gray-900">{crop.area}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-1"><Calendar size={12} /> Planted</p>
                        <p className="text-sm font-semibold text-gray-900">{crop.planted}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg md:col-span-2 lg:col-span-1">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1 flex items-center gap-1"><MapPin size={12} /> Location</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{crop.location}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Soil Type</p>
                        <p className="text-sm font-semibold text-gray-900">{crop.soil_type}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Irrigation</p>
                        <p className="text-sm font-semibold text-gray-900">{crop.irrigation_type}</p>
                    </div>
                </div>
            </motion.div>

            {/* Crop Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><Sprout size={24} /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Current Stage</p>
                        <p className="text-lg font-bold text-gray-900">{crop.stage}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center text-cyan-600"><Droplets size={24} /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Water Requirement</p>
                        <p className="text-lg font-bold text-gray-900">{crop.water_req}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${crop.risk === 'High Risk' ? 'bg-red-50 text-red-600' : crop.risk === 'Medium Risk' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Crop Risk</p>
                        <p className={`text-lg font-bold ${crop.risk === 'High Risk' ? 'text-red-700' : crop.risk === 'Medium Risk' ? 'text-amber-700' : 'text-green-700'}`}>{crop.risk}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600"><Activity size={24} /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Health Score</p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-black text-gray-900">{crop.health_score}<span className="text-sm font-medium text-gray-500">/100</span></p>
                            {crop.health_score > 80 ? <TrendingUp size={16} className="text-green-500" /> : <TrendingUp size={16} className="text-red-500 rotate-180 transform" />}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Crop Growth Cycle Animation */}
                    {/* Crop Growth Cycle Animation Visualization */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Sprout className="text-agri-green" size={20} /> Animated Crop Lifecycle
                        </h3>

                        {/* New Realistic Growth Animation & Leaf Timeline */}
                        <div className="py-4">
                            <CropGrowthAnimation currentStage={crop.stage} />
                        </div>

                        {/* Smart Growth Insights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                <div className="flex items-center gap-2 text-blue-600 mb-1">
                                    <Clock size={16} />
                                    <span className="text-xs font-bold uppercase">Sowing Time</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">{daysSinceSowing} Days</p>
                                <p className="text-xs text-gray-500 mt-1">Since planting date</p>
                            </div>
                            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100/50">
                                <div className="flex items-center gap-2 text-green-600 mb-1">
                                    <Sprout size={16} />
                                    <span className="text-xs font-bold uppercase">Current Phase</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">{crop.stage}</p>
                                <p className="text-xs text-gray-500 mt-1">Optimal growth rate</p>
                            </div>
                            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50">
                                <div className="flex items-center gap-2 text-purple-600 mb-1">
                                    <TrendingUp size={16} />
                                    <span className="text-xs font-bold uppercase">Prediction</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900 mt-1">Next: {stages[stages.indexOf(crop.stage) + 1] || 'Harvesting'}</p>
                                <p className="text-xs text-gray-500 mt-1">Expected in ~12 days</p>
                            </div>
                        </div>
                    </div>

                    {/* Crop Health Timeline */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Activity className="text-blue-500" size={20} /> Crop Health Timeline
                            </h3>
                            <button onClick={() => router.push('/disease')} className="text-xs font-bold text-blue-600 hover:underline">View History</button>
                        </div>

                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                            {[
                                { date: '25 March', score: 90, disease: 'Recovered', reco: 'Continue maintaining current irrigation level.', color: 'green', dot: 'bg-green-500' },
                                { date: '18 March', score: 81, disease: 'Leaf Rust Detected', reco: 'Apply propiconazole fungicide immediately.', color: 'red', dot: 'bg-red-500' },
                                { date: '12 March', score: 88, disease: 'None', reco: 'Crop is healthy. Applied standard NPK fertilizer.', color: 'blue', dot: 'bg-blue-500' },
                            ].map((item, idx) => (
                                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${item.dot} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                                        {item.color === 'green' && <Sprout size={16} className="text-white" />}
                                        {item.color === 'red' && <ShieldAlert size={16} className="text-white" />}
                                        {item.color === 'blue' && <Camera size={16} className="text-white" />}
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-bold text-gray-900">{item.date}</p>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.color === 'red' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>Score: {item.score}</span>
                                        </div>
                                        <p className={`text-xs font-bold uppercase mb-2 ${item.color === 'red' ? 'text-red-500' : 'text-gray-500'}`}>{item.disease}</p>
                                        <p className="text-sm text-gray-600">{item.reco}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Quick Tools */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/disease')}
                                className="w-full flex items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-200 p-3 rounded-lg transition-colors text-left group"
                            >
                                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-agri-green group-hover:text-white transition-colors">
                                    <Camera size={20} className="text-agri-green group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Scan Crop Disease</p>
                                    <p className="text-xs text-gray-500">Run AI disease detection</p>
                                </div>
                            </button>
                            <button
                                onClick={() => alert("Checking water advice...")}
                                className="w-full flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 p-3 rounded-lg transition-colors text-left group"
                            >
                                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <Droplet size={20} className="text-blue-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Get Water Advice</p>
                                    <p className="text-xs text-gray-500">View irrigation schedules</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* System Alerts */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-amber-500" size={20} /> Active Alerts
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 bg-amber-50 rounded-lg p-3 border border-amber-100">
                                <Thermometer className="text-amber-600 mt-0.5 shrink-0" size={16} />
                                <div>
                                    <p className="text-sm font-bold text-amber-900">High Temperature Risk</p>
                                    <p className="text-xs text-amber-700 mt-1">Temperatures exceeding 35°C expected next week. Increase irrigation frequency to prevent heat stress.</p>
                                </div>
                            </div>
                            {crop.risk === 'High Risk' && (
                                <div className="flex items-start gap-3 bg-red-50 rounded-lg p-3 border border-red-100">
                                    <ShieldAlert className="text-red-600 mt-0.5 shrink-0" size={16} />
                                    <div>
                                        <p className="text-sm font-bold text-red-900">Disease Outbreak Vulnerability</p>
                                        <p className="text-xs text-red-700 mt-1">High humidity is creating a perfect condition for fungal infections. Apply preventative sprays.</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                                <Droplets className="text-blue-600 mt-0.5 shrink-0" size={16} />
                                <div>
                                    <p className="text-sm font-bold text-blue-900">Soil Moisture Dropping</p>
                                    <p className="text-xs text-blue-700 mt-1">Sensor data indicates soil moisture is running moderately low. Plan irrigation within 48 hours.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FarmerDashboardLayout >
    );
}
