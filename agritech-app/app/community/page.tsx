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
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Leaf } from 'lucide-react';

export default function CommunityPage() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        diseaseName: '',
        cropAffected: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedOutbreak, setSelectedOutbreak] = useState<any>(null);

    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        const fetchReports = async () => {
            const { data } = await supabase
                .from('community_reports')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            
            if (data) setReports(data);
        };

        fetchReports();

        const channel = supabase
            .channel('community-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'community_reports'
                },
                (payload) => {
                    setReports((prev) => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleSubmit = async () => {
        if (!formData.diseaseName || !formData.cropAffected) {
            alert(t('community.fillRequired'));
            return;
        }

        setIsSubmitting(true);
        try {
            // Get user's location for the report
            let lat = 19.0760;
            let lng = 72.8777;

            if (navigator.geolocation) {
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                } catch (geoErr) {
                    console.error("Location error", geoErr);
                }
            }

            const payload = {
                title: formData.diseaseName,
                description: `${formData.cropAffected} - ${formData.description}`,
                latitude: lat,
                longitude: lng,
                location_name: "Local Farm", // In a real app we'd reverse-geocode lat/lng here
                severity: "Moderate"
            };

            console.log("Submitting:", payload);

            const { error } = await supabase
                .from("community_reports")
                .insert([payload]);

            if (error) {
                 console.error("Supabase Error:", error);
                 alert(t('community.fail'));
            } else {
                 alert("Report submitted successfully");
                 setFormData({ diseaseName: '', cropAffected: '', description: '' });
                 // No page refresh! Realtime updates UI + Map automatically
            }
        } catch (err) {
            console.error('Error submitting report:', err);
            alert(t('community.fail'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FarmerDashboardLayout>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('community.diseaseMap')}</h2>
                <div className="h-64 sm:h-96 relative z-0">
                    <DiseaseMap />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{t('community.recentOutbreaks')}</h3>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {reports.length === 0 && <p className="text-gray-400 text-sm">No recent outbreaks reported.</p>}
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                onClick={() => setSelectedOutbreak(report)}
                                className="bg-gray-50 border border-gray-100 p-4 rounded-xl cursor-pointer hover:bg-green-50/50 hover:border-agri-green/30 transition-all shadow-sm hover:shadow-md group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-gray-900 font-semibold group-hover:text-agri-green transition-colors">
                                        {report.title}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border bg-amber-50 text-amber-700 border-amber-100`}>
                                        {report.severity || "Moderate"}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{report.description}</p>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{report.location_name || 'Near you'}</span>
                                </div>
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
                            {isSubmitting ? t('community.submitting') : t('community.submitReport')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Outbreak Details Modal */}
            <AnimatePresence>
                {selectedOutbreak && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedOutbreak(null)}
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl border border-gray-100"
                        >
                            <div className={`h-2 w-full ${selectedOutbreak.severity === 'High' ? 'bg-red-500' : selectedOutbreak.severity === 'Moderate' ? 'bg-amber-500' : 'bg-blue-500'}`} />

                            <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
                                <button
                                    onClick={() => setSelectedOutbreak(null)}
                                    className="absolute top-6 right-6 p-2 bg-gray-100 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                <div className="pr-12 mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedOutbreak.title}</h3>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 bg-amber-100 text-amber-700`}>
                                            <AlertTriangle size={14} /> {selectedOutbreak.severity || 'Moderate'} {t('community.riskLevel')}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                            {selectedOutbreak.location_name || 'Confirmed Location'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                                            <AlertTriangle size={16} /> Description
                                        </h4>
                                        <p className="text-sm text-blue-800 leading-relaxed font-medium">
                                            {selectedOutbreak.description}
                                        </p>
                                    </div>

                                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                        <h4 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                                            <CheckCircle size={16} /> Date Reported
                                        </h4>
                                        <p className="text-sm text-green-800 leading-relaxed font-medium">
                                            {new Date(selectedOutbreak.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </FarmerDashboardLayout>
    );
}
