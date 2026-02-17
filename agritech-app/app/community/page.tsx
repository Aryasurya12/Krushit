'use client';

import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { useTranslation } from 'react-i18next';

export default function CommunityPage() {
    const { t } = useTranslation();

    return (
        <FarmerDashboardLayout>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('community.diseaseMap')}</h2>
                <div className="bg-gray-100 rounded-xl h-64 sm:h-96 flex items-center justify-center border border-gray-200">
                    <div className="text-center">
                        <div className="text-6xl mb-4 grayscale opacity-50">🗺️</div>
                        <p className="text-gray-500 font-medium">{t('community.mapDesc')}</p>
                        <p className="text-sm text-gray-400 mt-2">{t('community.comingSoon')}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{t('community.recentOutbreaks')}</h3>
                    <div className="space-y-3">
                        {[
                            { disease: 'Leaf Rust', location: 'Within 5 km', severity: 'High', reports: 12 },
                            { disease: 'Blast Disease', location: 'Within 10 km', severity: 'Moderate', reports: 8 },
                            { disease: 'Aphid Infestation', location: 'Within 3 km', severity: 'Low', reports: 5 },
                        ].map((outbreak, i) => (
                            <div key={i} className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-gray-900 font-semibold">
                                        {/* Ideally these should be localized too if hardcoded */}
                                        {t(`scan.diseases.${outbreak.disease === 'Leaf Rust' ? 'leafRust' : outbreak.disease === 'Blast Disease' ? 'blast' : 'aphids'}`) || outbreak.disease}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${outbreak.severity === 'High' ? 'bg-red-100 text-red-700' :
                                        outbreak.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {t(`community.${outbreak.severity.toLowerCase()}`)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">{outbreak.location} • {outbreak.reports} {t('community.reports')}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{t('community.reportDisease')}</h3>
                    <div className="space-y-4">
                        <input type="text" placeholder={t('community.diseaseName')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green bg-gray-50 transition-all placeholder:text-gray-400" />
                        <input type="text" placeholder={t('community.cropAffected')} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green bg-gray-50 transition-all placeholder:text-gray-400" />
                        <textarea placeholder={t('community.description')} rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green bg-gray-50 transition-all placeholder:text-gray-400" />
                        <button className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors shadow-sm">{t('community.submitReport')}</button>
                    </div>
                </div>
            </div>
        </FarmerDashboardLayout>
    );
}
