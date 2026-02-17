'use client';

import { useState, useRef } from 'react';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { useTranslation } from 'react-i18next';
import { Upload, Camera, AlertTriangle, CheckCircle, FileText, Share2, Save, X, Droplets, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ScanCropPage() {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [saving, setSaving] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setAnalyzing(true);
        try {
            // 1. Prepare the image for the backend
            const formData = new FormData();
            formData.append('file', selectedFile);

            // 2. Send to our new FastAPI ML Backend
            const response = await fetch(`http://127.0.0.1:8001/predict?language=${i18n.language}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to analyze image');
            }

            const data = await response.json();

            // 3. Update the UI with REAL results from the model
            setResult({
                disease: data.disease,
                diseaseLocal: data.disease,
                confidence: data.confidence,
                severity: data.confidence > 80 ? 'high' : 'medium',
                solution: {
                    name: { en: data.disease, hi: data.disease, mr: data.disease },
                    cause: {
                        en: "Detected via leaf pattern analysis.",
                        hi: "पत्ती पैटर्न विश्लेषण के माध्यम से पता चला।",
                        mr: "पानांच्या नमुन्यावरून आढळले."
                    },
                    solution: {
                        en: typeof data.solution === 'string' ? [data.solution] : [data.solution],
                        hi: typeof data.solution === 'string' ? [data.solution] : [data.solution],
                        mr: typeof data.solution === 'string' ? [data.solution] : [data.solution]
                    },
                    prevention: {
                        en: typeof data.prevention === 'string' ? [data.prevention] : [data.prevention],
                        hi: typeof data.prevention === 'string' ? [data.prevention] : [data.prevention],
                        mr: typeof data.prevention === 'string' ? [data.prevention] : [data.prevention]
                    },
                    fertilizer: {
                        en: data.fertilizer_advice,
                        hi: data.fertilizer_advice,
                        mr: data.fertilizer_advice
                    }
                }
            });
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Scan error:', error);
            setResult({
                disease: 'Error',
                confidence: 0,
                severity: 'high',
                diseaseLocal: error.message === 'Failed to fetch'
                    ? 'Cannot connect to ML server. Is the Python script running?'
                    : `Analysis Error: ${error.message}`
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!result || !user || result.disease === 'Error') return;

        setSaving(true);
        try {
            // 1. Generate PDF Report FIRST (Prioritize User Value)
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.setTextColor(22, 163, 74);
            doc.text("Krushit Disease Diagnosis", 14, 20);

            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);

            // Diagnosis Info
            autoTable(doc, {
                startY: 35,
                body: [
                    ['Disease Detected', result.diseaseLocal],
                    ['Confidence', `${result.confidence}%`],
                    ['Severity', result.severity.toUpperCase()],
                ],
                theme: 'striped',
                headStyles: { fillColor: [22, 163, 74] }
            });

            // Treatment & Prevention
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const finalY = (doc as any).lastAutoTable.finalY + 10;

            if (result.solution) {
                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text("Treatment Plan", 14, finalY);

                const treatmentSteps = result.solution.solution.en || [];
                const preventionSteps = result.solution.prevention.en || [];

                autoTable(doc, {
                    startY: finalY + 5,
                    head: [['Category', 'Details']],
                    body: [
                        ['Cause', result.solution.cause.en || 'N/A'],
                        ['Treatment', Array.isArray(treatmentSteps) ? treatmentSteps.join('\n') : treatmentSteps],
                        ['Prevention', Array.isArray(preventionSteps) ? preventionSteps.join('\n') : preventionSteps],
                        ['Fertilizer', result.solution.fertilizer.en || 'N/A'],
                    ],
                    styles: { cellWidth: 'wrap' },
                    columnStyles: { 0: { cellWidth: 40 } }
                });
            }

            // Save PDF
            doc.save(`Disease_Report_${result.disease.replace(/\s+/g, '_')}.pdf`);

            // 2. Try Save to Supabase (Best Effort)
            try {
                const { error } = await supabase.from('disease_scans').insert({
                    user_id: user.id,
                    disease_detected: result.disease,
                    confidence: result.confidence,
                    severity: result.severity,
                    image_url: selectedImage || '',
                    treatment: result.solution?.solution?.en?.[0] || '',
                    prevention: result.solution?.prevention?.en?.[0] || ''
                });

                if (error) throw error;
                alert('✅ Report saved to cloud & downloaded!');
            } catch (dbError: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                console.warn('Cloud save failed (RLS likely):', dbError);
                // Friendly message acknowledging success despite partial failure
                alert('⚠️ Report downloaded. (Cloud save failed due to permissions)');
            }

        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('PDF Generation error:', error);
            alert('❌ Failed to generate report: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleShare = async () => {
        if (!result) return;

        const shareData = {
            title: 'Krushit Disease Scan',
            text: `I scanned my crop using Krushit! Detected: ${result.diseaseLocal} (${result.confidence}% confidence).`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
                alert('Analysis copied to clipboard!');
            }
        } catch (err) {
            console.error('Share failed:', err);
        }
    };

    return (
        <FarmerDashboardLayout>
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('nav.scanCrop')}</h1>
                    <p className="text-sm text-gray-500">{t('scan.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Input */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Camera size={20} className="text-agri-green" /> {t('scan.uploadTitle')}
                            </h2>

                            {/* Drop Zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 relative overflow-hidden group ${selectedImage ? 'border-agri-green/50 bg-gray-50' : 'border-gray-300 hover:border-agri-green hover:bg-green-50/50'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />

                                {selectedImage ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={selectedImage} alt="Crop" className="w-full h-full object-contain p-2" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedImage(null);
                                                setResult(null);
                                            }}
                                            className="absolute top-4 right-4 bg-white/90 text-gray-600 hover:text-red-500 p-2 rounded-full shadow-sm transition-colors border border-gray-200"
                                        >
                                            <X size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center p-6">
                                        <div className="w-16 h-16 bg-green-100/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Upload size={32} className="text-agri-green/80" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-700 mb-1">{t('scan.clickUpload')}</p>
                                        <p className="text-xs text-gray-400">{t('scan.supports')}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <FileText size={18} /> {t('scan.selectFile')}
                                </button>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!selectedImage || analyzing}
                                    className={`flex-1 py-3 px-4 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 text-sm shadow-md ${!selectedImage || analyzing
                                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-agri-green to-emerald-600 hover:shadow-lg hover:-translate-y-0.5'
                                        }`}
                                >
                                    {analyzing ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            {t('scan.analyzing')}
                                        </span>
                                    ) : (
                                        <>{t('scan.analyze')}</>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                            <div className="shrink-0 mt-0.5">
                                <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">i</div>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-blue-900 mb-1">{t('scan.tipTitle')}</h4>
                                <p className="text-xs text-blue-700 leading-relaxed">{t('scan.tipDesc')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Results */}
                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            {result ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    {/* Diagnosis Card */}
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
                                        <div className={`absolute top-0 left-0 w-2 h-full ${result.severity === 'high' ? 'bg-red-500' : result.severity === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                            }`}></div>

                                        <div className="pl-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('scan.detected')}</p>
                                                    <h3 className="text-2xl font-bold text-gray-900">{result.diseaseLocal}</h3>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('scan.confidence')}</p>
                                                    <p className="text-2xl font-bold text-agri-green">{result.confidence}%</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 mb-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 ${result.severity === 'high' ? 'bg-red-100 text-red-700' :
                                                    result.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    <AlertTriangle size={12} /> {result.severity} {t('scan.severity')}
                                                </span>
                                            </div>

                                            {/* Cause */}
                                            {result.solution && (
                                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-4">
                                                    <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                                                        <AlertTriangle size={16} />
                                                        Cause
                                                    </h4>
                                                    <p className="text-sm text-blue-800 leading-relaxed">
                                                        {result.solution.cause[i18n.language as 'en' | 'hi' | 'mr']}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Treatment Solution */}
                                            {result.solution && (
                                                <div className="bg-green-50 rounded-xl p-4 border border-green-100 mb-4">
                                                    <h4 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                                                        <CheckCircle size={16} />
                                                        Treatment Solution
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {result.solution.solution[i18n.language as 'en' | 'hi' | 'mr'].map((step: string, idx: number) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                                                                <span className="w-5 h-5 bg-green-200 text-green-900 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                                                    {idx + 1}
                                                                </span>
                                                                <span className="leading-relaxed">{step}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Prevention */}
                                            {result.solution && (
                                                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 mb-4">
                                                    <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                                                        <AlertTriangle size={16} />
                                                        Prevention Tips
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {result.solution.prevention[i18n.language as 'en' | 'hi' | 'mr'].map((tip: string, idx: number) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm text-purple-800">
                                                                <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-purple-600" />
                                                                <span className="leading-relaxed">{tip}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Fertilizer Recommendation */}
                                            {result.solution?.fertilizer && (
                                                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-4">
                                                    <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                                                        <Leaf size={16} />
                                                        Fertilizer Recommendation
                                                    </h4>
                                                    <p className="text-sm text-amber-800 leading-relaxed">
                                                        {result.solution.fertilizer[i18n.language as 'en' | 'hi' | 'mr']}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Irrigation Advice */}
                                            {result.solution?.irrigation && (
                                                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100">
                                                    <h4 className="text-sm font-bold text-cyan-900 mb-2 flex items-center gap-2">
                                                        <Droplets size={16} />
                                                        Irrigation Advice
                                                    </h4>
                                                    <p className="text-sm text-cyan-800 leading-relaxed">
                                                        {result.solution.irrigation[i18n.language as 'en' | 'hi' | 'mr']}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm text-sm"
                                        >
                                            {saving ? (
                                                <span className="w-4 h-4 border-2 border-agri-green/30 border-t-agri-green rounded-full animate-spin"></span>
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            {saving ? t('auth.processing') : t('scan.save')}
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm"
                                        >
                                            <Share2 size={18} /> {t('scan.share')}
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8"
                                >
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle size={32} className="text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t('scan.pendingTitle')}</h3>
                                    <p className="text-sm text-gray-500 max-w-xs mx-auto">{t('scan.pendingDesc')}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </FarmerDashboardLayout>
    );
}
