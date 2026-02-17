'use client';


import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Sprout, Droplets, AlertTriangle, Activity, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Quick Stat Card Component (Clean & Professional)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StatCard = ({ title, value, unit, change, trend, icon: Icon, colorClass }: any) => (
    <div className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden group`}>
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-300 ${colorClass}`}>
            <Icon size={48} />
        </div>

        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
                <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
            </div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
        </div>

        <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            <span className="text-sm text-gray-500 font-medium">{unit}</span>
        </div>

        <div className="flex items-center text-xs font-medium">
            {trend === 'up' ? <ArrowUp size={12} className="text-green-500 mr-1" /> : <ArrowDown size={12} className="text-red-500 mr-1" />}
            <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>{change}</span>
            <span className="text-gray-400 ml-1">vs last week</span>
        </div>
    </div>
);

// Action Card Component (Minimalist)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ActionCard = ({ title, subtitle, icon: Icon, href, colorClass, launchText }: any) => (
    <Link href={href} className="group flex items-start p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-agri-green/30 hover:shadow-md transition-all duration-200">
        <div className={`p-3 rounded-xl mr-5 group-hover:scale-110 transition-transform duration-300 ${colorClass} bg-opacity-10 text-opacity-100`}>
            <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
        </div>
        <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-agri-green transition-colors">{title}</h4>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">{subtitle}</p>
            <div className="flex items-center text-sm font-semibold text-agri-green group-hover:underline decoration-2 underline-offset-4">
                {launchText} <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    </Link>
);

export default function FarmerHomePage() {
    const { t } = useTranslation();

    const alerts = [
        { title: t('dashboard.alerts.soilLow'), time: '2h ago', type: 'warning', msg: t('dashboard.alerts.zoneA') },
        { title: t('dashboard.alerts.pestDetected'), time: '5h ago', type: 'danger', msg: t('dashboard.alerts.aphids') },
        { title: t('dashboard.alerts.reportReady'), time: '1d ago', type: 'info', msg: t('dashboard.alerts.summary') },
    ];

    const handleGenerateReport = () => {
        const doc = new jsPDF();
        const date = new Date().toLocaleDateString();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(22, 163, 74); // Agri-green
        doc.text("Krushit Farm Report", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${date}`, 14, 28);

        // Farm Stats Table
        autoTable(doc, {
            startY: 35,
            head: [['Metric', 'Value', 'Status']],
            body: [
                ['Current Stage', t('dashboard.stat.vegetative'), 'Healthy'],
                ['Water Needed', t('dashboard.stat.required'), 'Urgent'],
                ['Crop Risk', t('dashboard.stat.low'), 'Low'],
                ['Farm Health Score', '92/100', 'Excellent']
            ],
            headStyles: { fillColor: [22, 163, 74] },
            theme: 'grid'
        });

        // Alerts Section
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Recent Alerts", 14, finalY);

        autoTable(doc, {
            startY: finalY + 5,
            head: [['Alert', 'Time', 'Message']],
            body: alerts.map(a => [a.title, a.time, a.msg]),
            headStyles: { fillColor: [220, 38, 38] }, // Red for alerts
        });

        // Save
        const fileName = `Farm_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    };

    return (
        <FarmerDashboardLayout>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('dashboard.title')}</h1>
                    <p className="text-sm text-gray-500">{t('dashboard.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-md border border-green-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> {t('dashboard.liveData')}
                    </span>
                    <button
                        onClick={handleGenerateReport}
                        className="text-sm font-medium text-white bg-agri-dark hover:bg-black px-4 py-2 rounded-lg shadow-sm transition-colors"
                    >
                        {t('dashboard.generateReport')}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t('dashboard.stat.currentStage')}
                    value={t('dashboard.stat.vegetative')}
                    unit=""
                    change="+12%"
                    trend="up"
                    icon={Sprout}
                    colorClass="bg-green-500"
                />
                <StatCard
                    title={t('dashboard.stat.waterNeeded')}
                    value={t('dashboard.stat.required')}
                    unit={t('dashboard.stat.urgent')}
                    change={t('dashboard.stat.lowMoisture')}
                    trend="down"
                    icon={Droplets}
                    colorClass="bg-blue-500"
                />
                <StatCard
                    title={t('dashboard.stat.cropRisk')}
                    value={t('dashboard.stat.low')}
                    unit={t('dashboard.stat.risk')}
                    change="-5%"
                    trend="down" // Good thing
                    icon={AlertTriangle}
                    colorClass="bg-amber-500"
                />
                <StatCard
                    title={t('dashboard.stat.farmHealth')}
                    value="92"
                    unit="/ 100"
                    change="+2"
                    trend="up"
                    icon={Activity}
                    colorClass="bg-purple-500"
                />
            </div>

            {/* Quick Actions & Recent Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Actions Column */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {t('dashboard.quickTools')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ActionCard
                            title={t('dashboard.tools.scanTitle')}
                            subtitle={t('dashboard.tools.scanDesc')}
                            icon={Sprout}
                            href="/disease"
                            colorClass="bg-green-600"
                            launchText={t('dashboard.tools.launch')}
                        />
                        <ActionCard
                            title={t('dashboard.tools.waterTitle')}
                            subtitle={t('dashboard.tools.waterDesc')}
                            icon={Droplets}
                            href="/iot"
                            colorClass="bg-blue-600"
                            launchText={t('dashboard.tools.launch')}
                        />
                    </div>

                    {/* Recent Activity / Chart Placeholder */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">{t('dashboard.yieldForecast')}</h3>
                            <select className="text-sm border-gray-200 rounded-md text-gray-500 bg-gray-50 p-1">
                                <option>{t('dashboard.thisSeason')}</option>
                                <option>{t('dashboard.lastYear')}</option>
                            </select>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-2 px-2">
                            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                <div key={i} className="w-full bg-gray-100 rounded-t-sm relative group hover:bg-agri-green/20 transition-colors" style={{ height: `${h}%` }}>
                                    <div className="absolute bottom-0 w-full bg-agri-green rounded-t-sm transition-all duration-500" style={{ height: `${h * 0.8}%` }}></div>
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded pointer-events-none transition-opacity">
                                        {h * 10}kg
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium uppercase tracking-wide">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </div>
                </div>

                {/* Alerts Sidebar */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {t('dashboard.systemAlerts')}
                    </h3>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        {alerts.map((alert, i) => (
                            <div key={i} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0 cursor-pointer group">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-agri-green transition-colors">{alert.title}</h4>
                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{alert.time}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{alert.msg}</p>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${alert.type === 'warning' ? 'bg-amber-400' :
                                        alert.type === 'danger' ? 'bg-red-400' : 'bg-blue-400'
                                        }`}></span>
                                    <span className="text-[10px] uppercase font-bold text-gray-400">{alert.type}</span>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-3 text-xs font-bold text-gray-500 hover:text-agri-dark hover:bg-gray-50 transition-colors uppercase tracking-wide">
                            {t('dashboard.viewAllAlerts')}
                        </button>
                    </div>

                    {/* Pro Tip Card */}
                    <div className="bg-gradient-to-br from-agri-dark to-black p-5 rounded-xl text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sprout size={80} />
                        </div>
                        <h4 className="font-bold text-lg mb-2 relative z-10">{t('dashboard.proTip')}</h4>
                        <p className="text-sm text-gray-300 mb-4 leading-relaxed relative z-10">
                            {t('dashboard.proTipContent')}
                        </p>
                        <button className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded border border-white/20 transition-colors">
                            {t('dashboard.readMore')}
                        </button>
                    </div>
                </div>
            </div>
        </FarmerDashboardLayout>
    );
}
