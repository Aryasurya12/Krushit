'use client';

import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';

const DiseaseMap = dynamic(() => import('@/components/DiseaseMap'), {
    ssr: false,
    loading: () => (
        <div className="bg-gray-100 rounded-xl h-64 sm:h-96 flex items-center justify-center border border-gray-200">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-green mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading Community Map...</p>
            </div>
        </div>
    )
});

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CommunityPage() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        diseaseName: '',
        cropAffected: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!formData.diseaseName || !formData.cropAffected) {
            alert('Please fill in required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            // Get user's location for the report
            let lat = 19.0760;
            let lng = 72.8777;

            if (navigator.geolocation) {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
            }

            const { error } = await supabase
                .from('community_disease_records')
                .insert([
                    {
                        disease_name: formData.diseaseName,
                        crop_type: formData.cropAffected,
                        location_lat: lat,
                        location_lng: lng,
                        severity: 'Moderate', // Default for now
                        reported_date: new Date().toISOString().split('T')[0],
                        description: formData.description
                    }
                ]);

            if (error) throw error;

            alert('Report submitted successfully!');
            setFormData({ diseaseName: '', cropAffected: '', description: '' });
            // Refresh the page to show new marker (or use state management)
            window.location.reload();
        } catch (err) {
            console.error('Error submitting report:', err);
            alert('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FarmerDashboardLayout>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('community.diseaseMap')}</h2>
                <div className="h-64 sm:h-96">
                    <DiseaseMap />
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
                        <input
                            type="text"
                            placeholder={t('community.diseaseName')}
                            value={formData.diseaseName}
                            onChange={(e) => setFormData({ ...formData, diseaseName: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green bg-gray-50 transition-all placeholder:text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder={t('community.cropAffected')}
                            value={formData.cropAffected}
                            onChange={(e) => setFormData({ ...formData, cropAffected: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green bg-gray-50 transition-all placeholder:text-gray-400"
                        />
                        <textarea
                            placeholder={t('community.description')}
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green bg-gray-50 transition-all placeholder:text-gray-400"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors shadow-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Submitting...' : t('community.submitReport')}
                        </button>
                    </div>
                </div>
            </div>
        </FarmerDashboardLayout>
    );
}
