'use client';

import React, { useState } from 'react';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ExternalLink, X, FileText, CheckCircle, Info, Landmark, Bell } from 'lucide-react';

export default function SchemesPage() {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedScheme, setSelectedScheme] = useState<any | null>(null);

    const categoriesList = [
        { id: 'all', label: t('schemes.filterCategory') },
        { id: 'subsidy', label: t('schemes.categories.subsidy') },
        { id: 'insurance', label: t('schemes.categories.insurance') },
        { id: 'equipment', label: t('schemes.categories.equipment') },
        { id: 'irrigation', label: t('schemes.categories.irrigation') },
        { id: 'soilHealth', label: t('schemes.categories.soilHealth') },
        { id: 'finance', label: t('schemes.categories.finance') }
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schemesList: any[] = (t('schemes.list', { returnObjects: true }) as any) || [];

    // Provide a fallback mostly mapped array if the translation hook hasn't returned objects fully yet
    const safeSchemesList = Array.isArray(schemesList) ? schemesList : [];

    const filteredSchemes = safeSchemesList.filter(scheme => {
        const matchesSearch = scheme.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              scheme.shortDesc?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <FarmerDashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-0">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-agri-green to-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20">
                                <Landmark size={28} />
                            </div>
                            {t('schemes.title')}
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg">{t('schemes.subtitle')}</p>
                    </div>
                </div>

                {/* Dashboard layout - 2 columns */}
                <div className="flex flex-col xl:flex-row gap-6">
                    {/* Main Content */}
                    <div className="flex-1 space-y-6 max-w-5xl">
                        {/* Search and Filter */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder={t('schemes.searchPlaceholder')}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-agri-green/50 focus:bg-white transition-all text-sm font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="relative min-w-[200px]">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <select 
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-agri-green/50 cursor-pointer focus:bg-white transition-all text-sm font-medium text-gray-700 font-sans"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categoriesList.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Schemes Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredSchemes.map((scheme, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-agri-green/5 hover:border-agri-green/20 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer group"
                                    onClick={() => setSelectedScheme(scheme)}
                                >
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="inline-block px-3 py-1 bg-[#EEF5F0] text-[#2F6B4A] text-xs font-bold rounded-md border border-[#D5E6DC] uppercase tracking-wide">
                                                {t(`schemes.categories.${scheme.category}`)}
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#EEF5F0] group-hover:text-agri-green transition-colors">
                                                <ExternalLink size={16} />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-agri-green transition-colors">{scheme.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1 leading-relaxed">{scheme.shortDesc}</p>
                                        
                                        <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100/80">
                                            <p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-1 flex items-center gap-1.5">
                                                <CheckCircle size={14} className="text-emerald-500" /> {t('schemes.benefits')}
                                            </p>
                                            <p className="text-sm font-medium text-gray-700 line-clamp-2">{scheme.benefits}</p>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                        <span className="text-sm font-bold text-agri-green flex items-center gap-1.5">
                                            {t('schemes.viewDetails')} 
                                            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        
                        {filteredSchemes.length === 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-5 border border-gray-100 shadow-inner">
                                    <Search size={36} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No schemes found</h3>
                                <p className="text-gray-500 max-w-sm">We couldn't find any schemes matching your filters. Try adjusting your search criteria.</p>
                                <button 
                                    onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                                    className="mt-6 font-semibold text-agri-green px-6 py-2 rounded-xl bg-[#EEF5F0] hover:bg-[#D5E6DC] transition-colors"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Announcements */}
                    <div className="w-full xl:w-96 flex flex-col gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                            <div className="px-6 py-5 border-b border-gray-100 bg-[#1E2D24] text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                                        <Bell size={20} className="text-emerald-400" />
                                    </div>
                                    <h2 className="font-bold text-lg tracking-tight">{t('schemes.latestAnnouncements')}</h2>
                                </div>
                            </div>
                            <div className="p-6 space-y-6 relative">
                                <div className="absolute left-9 top-6 bottom-6 w-px bg-gray-100 z-0"></div>
                                
                                <div className="relative pl-10 z-10">
                                    <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shadow-sm"></div>
                                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 inline-block mb-1.5 uppercase tracking-wider">{t('schemes.new')}</span>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1.5">PM-KISAN 14th Installment</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">Check your bank account or portal status to confirm credit.</p>
                                </div>
                                
                                <div className="relative pl-10 z-10">
                                    <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-white border-2 border-gray-300"></div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1.5">KCC Renewal Extended</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">Farmers can now renew Kisan Credit Card limit by end of month without penalty.</p>
                                </div>
                                
                                <div className="relative pl-10 z-10">
                                    <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-white border-2 border-gray-300"></div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-1.5">PMFBY Rabi Enrollment Open</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">Enroll your Rabi crops to secure against climate uncertainties.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scheme Details Modal */}
            <AnimatePresence>
                {selectedScheme && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 bg-white rounded-t-3xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#EEF5F0] to-[#E2EFEB] text-agri-green rounded-xl flex items-center justify-center border border-[#D5E6DC] shadow-sm">
                                        <Landmark size={24} />
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-bold text-agri-green uppercase tracking-wider mb-1 block">{t(`schemes.categories.${selectedScheme.category}`)}</span>
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{selectedScheme.name}</h2>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedScheme(null)}
                                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8 bg-white">
                                
                                {/* Overview */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                            <Info size={18} />
                                        </div>
                                        {t('schemes.description')}
                                    </h3>
                                    <p className="text-gray-600 bg-gray-50/50 block p-5 rounded-2xl border border-gray-100 text-[15px] leading-relaxed font-medium">{selectedScheme.shortDesc}</p>
                                </div>

                                {/* Eligibility & Benefits */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 flex flex-col">
                                        <h3 className="text-[15px] font-bold text-blue-900 mb-3 flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
                                                <CheckCircle size={16} /> 
                                            </div>
                                            {t('schemes.eligibility')}
                                        </h3>
                                        <p className="text-blue-900/80 text-[15px] leading-relaxed font-medium flex-1">{selectedScheme.eligibility}</p>
                                    </div>
                                    <div className="bg-[#EEF5F0]/50 p-5 rounded-2xl border border-[#D5E6DC]/50 flex flex-col">
                                        <h3 className="text-[15px] font-bold text-emerald-900 mb-3 flex items-center gap-2">
                                            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md">
                                                <Landmark size={16} /> 
                                            </div>
                                            {t('schemes.benefits')}
                                        </h3>
                                        <p className="text-emerald-900/80 text-[15px] leading-relaxed font-bold flex-1">{selectedScheme.benefits}</p>
                                    </div>
                                </div>

                                {/* Documents & Steps */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <FileText size={18} />
                                            </div>
                                            {t('schemes.documents')}
                                        </h3>
                                        <div className="flex flex-col gap-2.5">
                                            {selectedScheme.documents?.map((doc: string, i: number) => (
                                                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                                    <span className="text-gray-700 text-[15px] font-medium">{doc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                                <CheckCircle size={18} />
                                            </div>
                                            {t('schemes.applicationSteps')}
                                        </h3>
                                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                            {selectedScheme.steps?.map((step: string, i: number) => (
                                                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active gap-4">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-gray-100 group-hover:bg-agri-green text-gray-500 group-hover:text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm transition-colors z-10 font-bold text-sm">
                                                        {i + 1}
                                                    </div>
                                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-[15px] text-gray-700 font-medium">
                                                        {step}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                            </div>

                            <div className="px-6 py-4 sm:px-8 sm:py-5 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex items-center justify-between gap-4 sticky bottom-0">
                                <button
                                    onClick={() => setSelectedScheme(null)}
                                    className="px-6 py-3 text-gray-600 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                                <a
                                    href={selectedScheme.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-3 bg-[#1E2D24] text-white rounded-xl font-bold hover:bg-[#2a3d32] transition-colors flex items-center gap-2 shadow-lg shadow-black/10 group"
                                >
                                    {t('schemes.apply')} 
                                    <ExternalLink size={18} className="text-white/70 group-hover:text-white transition-colors" />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </FarmerDashboardLayout>
    );
}
