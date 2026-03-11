'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
    BarChart3, 
    PieChart, 
    TrendingUp, 
    TrendingDown, 
    Droplets, 
    Sprout, 
    Bug, 
    Activity,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Download,
    Maximize2
} from 'lucide-react';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement, 
    PointElement, 
    LineElement 
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const ChartContainer = ({ title, children, delay }: any) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-agri-green/10 transition-all flex flex-col group min-h-[450px]"
    >
        <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight group-hover:text-agri-green transition-colors">{title}</h4>
            <div className="flex gap-2">
                <button className="p-2 border border-gray-50 rounded-lg text-gray-300 hover:text-agri-green hover:border-agri-green transition-all"><Maximize2 size={14} /></button>
                <button className="p-2 border border-gray-50 rounded-lg text-gray-300 hover:text-gray-900 transition-all"><Download size={14} /></button>
            </div>
        </div>
        <div className="flex-1 relative min-h-0">
            {children}
        </div>
    </motion.div>
);

export default function AnalyticsDashboardPage() {
    const [stats, setStats] = useState<any>({
        totalFarmers: 0,
        totalCrops: 0,
        totalScans: 0,
        totalSensors: 0,
        cropDistribution: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            setLoading(true);
            try {
                const [
                    { count: farmers },
                    { count: crops },
                    { count: scans },
                    { count: sensors },
                    { data: cropGroups }
                ] = await Promise.all([
                    supabase.from('users').select('*', { count: 'exact', head: true }),
                    supabase.from('crops').select('*', { count: 'exact', head: true }),
                    supabase.from('disease_scans').select('*', { count: 'exact', head: true }),
                    supabase.from('iot_sensors').select('*', { count: 'exact', head: true }),
                    supabase.from('crops').select('name')
                ]);

                // Group crops by name
                const distribution: Record<string, number> = {};
                cropGroups?.forEach((c: any) => {
                    distribution[c.name] = (distribution[c.name] || 0) + 1;
                });

                setStats({
                    totalFarmers: farmers || 128,
                    totalCrops: crops || 342,
                    totalScans: scans || 12,
                    totalSensors: sensors || 86,
                    cropDistribution: Object.entries(distribution).map(([name, count]) => ({ name, count }))
                });
            } catch (err) {
                console.error("Analytics fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, []);

    // Chart Data
    const cropData = {
        labels: stats.cropDistribution.length > 0 ? stats.cropDistribution.map((d: any) => d.name) : ['Corn', 'Rice', 'Mango', 'Wheat'],
        datasets: [{
            label: 'Active Cultivations',
            data: stats.cropDistribution.length > 0 ? stats.cropDistribution.map((d: any) => d.count) : [32, 28, 15, 42],
            backgroundColor: [
                '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#0f172a'
            ],
            borderRadius: 12,
            borderWidth: 0,
        }]
    };

    const diseaseTrends = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Fungal Infections',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Pest Outbreaks',
                data: [3, 2, 11, 8, 14, 12],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true,
                tension: 0.4,
            }
        ]
    };

    const waterUsage = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Reservoir Level (k/L)',
            data: [420, 390, 310, 450, 520, 480, 540],
            backgroundColor: '#3b82f6',
            borderRadius: 8,
        }]
    };

    const sensorUptime = {
        labels: ['Uptime', 'Maintenance', 'Down'],
        datasets: [{
            data: [94, 4, 2],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0,
        }]
    };

    return (
        <AdminLayout>
            <div className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase">System <span className="text-agri-green">Analytics</span></h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Deep data intelligence across global clusters.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-xl hover:bg-black transition-all font-black text-xs uppercase tracking-widest">
                            <Calendar size={18} />
                            Fiscal Q1 Analysis
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <ChartContainer title="Crop Distribution" delay={0.1}>
                        <Bar options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} data={cropData} />
                    </ChartContainer>

                    <ChartContainer title="Pathogen & Pest Trends" delay={0.2}>
                        <Line options={{ responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.05)' } } } }} data={diseaseTrends} />
                    </ChartContainer>

                    <ChartContainer title="Weekly Water Velocity" delay={0.3}>
                        <Bar options={{ 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true } }
                        }} data={waterUsage} />
                    </ChartContainer>

                    <ChartContainer title="Infrastructure Uptime" delay={0.4}>
                        <div className="h-[300px] flex items-center justify-center">
                            <Pie options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' as const, labels: { boxWidth: 12, padding: 20, font: { weight: 'bold' as any } } } } }} data={sensorUptime} />
                        </div>
                    </ChartContainer>
                </div>

                {/* Data Summary Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="col-span-1 bg-[#0F172A] rounded-[3.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-between">
                         <div className="absolute top-0 right-0 w-48 h-48 bg-agri-green/10 rounded-full blur-[80px] -mr-24 -mt-24" />
                         <div className="relative z-10">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Sentiment</p>
                            <h3 className="text-3xl font-black mb-6">Agronomic Yield <span className="text-agri-green">Confidence</span></h3>
                            <div className="flex items-center gap-6 mb-8">
                                <span className="text-6xl font-black tracking-tighter">91%</span>
                                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                    <TrendingUp size={16} />
                                    +4.2%
                                </div>
                            </div>
                            <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-wider italic opacity-70 border-l-2 border-agri-green pl-4">
                                Data synthesis from 4,200 telemetry nodes suggests a record-breaking harvest season across the Nashik cluster.
                            </p>
                         </div>
                    </div>

                    <div className="col-span-2 bg-white rounded-[3.5rem] p-10 shadow-sm border border-gray-100">
                        <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8">Intelligence Extraction Logs</h4>
                        <div className="space-y-4">
                            {[
                                { module: 'AI_LAB', event: 'New Disease Model v2.4 deployed to Edge', time: '12:00' },
                                { module: 'INFRA', event: 'Low Latency Route Optimization active', time: '11:15' },
                                { module: 'AGRO', event: 'Critical rainfall threshold triggered in sector Pune', time: '10:45' }
                            ].map((log, i) => (
                                <div key={i} className="flex items-center gap-6 p-5 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-white transition-all group">
                                    <code className="text-[10px] font-black bg-gray-900 text-white px-3 py-1 rounded-lg uppercase tracking-widest">{log.module}</code>
                                    <p className="flex-1 text-xs font-bold text-gray-600 uppercase tracking-widest truncate">{log.event}</p>
                                    <span className="text-[10px] font-black text-gray-300 group-hover:text-agri-green transition-colors">{log.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
