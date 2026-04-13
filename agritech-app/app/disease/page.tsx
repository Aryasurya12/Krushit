'use client';

import { useState, useRef, useEffect } from 'react';
import FarmerDashboardLayout from '@/components/FarmerDashboardLayout';
import { useTranslation } from 'react-i18next';
import { Upload, Camera, AlertTriangle, CheckCircle, FileText, Share2, Save, X, Leaf, History, TrendingUp as TrendUp, TrendingDown, Minus, ChevronDown, ChevronUp, ChevronRight, Calendar, ShoppingCart, Calculator, ExternalLink, ShieldCheck, Droplets, CloudRain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNotifications } from '@/contexts/NotificationContext';
import { cropsApi } from '@/lib/api';
import { getProtocol } from '@/lib/treatmentProtocols';

export default function ScanCropPage() {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [saving, setSaving] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = useState<any>(null);
    const [crops, setCrops] = useState<any[]>([]);
    const [selectedCropId, setSelectedCropId] = useState<string>('');
    const [scanHistory, setScanHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedHistoryScan, setSelectedHistoryScan] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Fetch crops on mount
    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const data = await cropsApi.getAll();
                setCrops(data || []);
                if (data && data.length > 0) {
                    setSelectedCropId(data[0].id);
                }
            } catch (err) {
                console.warn("Failed to fetch crops:", err);
            }
        };
        fetchCrops();
    }, []);

    // Fetch history whenever selected crop changes, using local storage
    const fetchHistory = async () => {
        if (!selectedCropId) return;
        setLoadingHistory(true);
        try {
            const rawData = localStorage.getItem(`disease_scans_${selectedCropId}`);
            let data = [];
            if (rawData) {
                data = JSON.parse(rawData);
            }
            data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
            setScanHistory(data);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (selectedCropId) fetchHistory();
    }, [selectedCropId, user]);

    // Calculate Health Trend
    const getHealthTrend = () => {
        if (scanHistory.length < 2) return { status: 'Stable', icon: Minus, color: 'text-gray-400' };

        const recent = scanHistory[0].health_score || 0;
        const previous = scanHistory[1].health_score || 0;

        if (recent > previous + 5) return { status: 'Improving', icon: TrendUp, color: 'text-agri-green' };
        if (recent < previous - 5) return { status: 'Declining', icon: TrendingDown, color: 'text-red-500' };
        return { status: 'Stable', icon: Minus, color: 'text-amber-500' };
    };

    const trend = getHealthTrend();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setResult(null);
                setIsCameraActive(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1024 }, height: { ideal: 1024 } }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
            setIsCameraActive(true);
            setSelectedImage(null);
            setResult(null);
        } catch (err) {
            console.error("Camera access denied:", err);
            alert("Camera access denied. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                setSelectedImage(dataUrl);

                // Convert to file for analysis
                const byteString = atob(dataUrl.split(',')[1]);
                const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeString });
                const file = new File([blob], "camera_capture.jpg", { type: mimeString });
                setSelectedFile(file);
                stopCamera();
            }
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setAnalyzing(true);
        try {
            // 1. Prepare the image for the backend
            const formData = new FormData();
            formData.append('file', selectedFile);

            // 2. Send to FastAPI ML Backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}/predict?language=${i18n.language}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to analyze image');
            }

            const data = await response.json();

            // 3. Map flat backend response directly to result state
            // Backend returns: disease, confidence, severity, cause, treatment, prevention, fertilizer
            setResult({
                disease: data.disease,
                diseaseLocal: data.disease,
                confidence: data.confidence,
                severity: (data.severity as string).toLowerCase(),
                cause: data.cause,
                treatment: data.treatment,
                prevention: data.prevention,
                fertilizer: data.fertilizer,
                rawClass: data.raw_class || data.disease // Ensure the raw class is stored for protocol lookup
            });

            // Trigger Notification
            addNotification(
                t('scan.detected') + ": " + data.disease,
                t('scan.scanDetectedDesc', { confidence: data.confidence }),
                'ai'
            );

            // AUTO-SAVE to database (as per requirement) via localStorage
            if (selectedCropId) {
                try {
                    const newScan = {
                        id: Date.now().toString(),
                        user_id: user?.id || 'local_user',
                        crop_id: selectedCropId,
                        disease_detected: data.disease,
                        confidence: data.confidence,
                        severity: (data.severity as string).toLowerCase(),
                        image_url: selectedImage || '',
                        treatment: data.treatment || '',
                        prevention: data.prevention || '',
                        health_score: data.disease.toLowerCase().includes('healthy') ? 95 : Math.max(20, 95 - data.confidence * 0.8),
                        created_at: new Date().toISOString()
                    };

                    const rawData = localStorage.getItem(`disease_scans_${selectedCropId}`);
                    let existingScans = [];
                    if (rawData) {
                        existingScans = JSON.parse(rawData);
                    }
                    existingScans.push(newScan);
                    localStorage.setItem(`disease_scans_${selectedCropId}`, JSON.stringify(existingScans));

                    fetchHistory();
                } catch (saveErr) {
                    console.warn("Auto-save to local storage failed:", saveErr);
                }
            }
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Scan error:', error);
            setResult({
                disease: 'Error',
                diseaseLocal: error.message === 'Failed to fetch'
                    ? 'Cannot connect to ML server. Is the Python script running?'
                    : `Analysis Error: ${error.message}`,
                confidence: 0,
                severity: 'high',
                cause: null,
                treatment: null,
                prevention: null,
                fertilizer: null,
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = async () => {
        // Now mostly acts as PDF export since auto-save is active
        if (!result || result.disease === 'Error') return;
        setSaving(true);
        try {
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.setTextColor(22, 163, 74);
            doc.text("Krushit Disease Diagnosis", 14, 20);
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);
            autoTable(doc, {
                startY: 35,
                body: [
                    ['Disease Detected', result.diseaseLocal || result.disease],
                    ['Confidence', `${result.confidence}%`],
                    ['Severity', String(result.severity).toUpperCase()],
                ],
                theme: 'striped',
                headStyles: { fillColor: [22, 163, 74] }
            });
            const finalY = (doc as any).lastAutoTable.finalY + 10;
            if (result.treatment || result.prevention) {
                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text("Treatment Plan", 14, finalY);
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [['Category', 'Details']],
                    body: [
                        ['Cause', result.cause || 'N/A'],
                        ['Treatment', result.treatment || 'N/A'],
                        ['Prevention', result.prevention || 'N/A'],
                        ['Fertilizer', result.fertilizer || 'N/A'],
                    ],
                    styles: { cellWidth: 'wrap' },
                    columnStyles: { 0: { cellWidth: 40 } }
                });
            }
            doc.save(`Disease_Report_${result.disease.replace(/\s+/g, '_')}.pdf`);
            addNotification(t('common.downloadSuccess'), "Your diagnosis report has been downloaded.", 'crop');
        } catch (error: any) {
            console.error('PDF Generation error:', error);
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
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('nav.scanCrop')}</h1>
                        <p className="text-sm text-gray-500 font-medium">{t('scan.subtitle')}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Leaf className="absolute left-4 top-1/2 -translate-y-1/2 text-agri-green" size={18} />
                            <select
                                value={selectedCropId}
                                onChange={(e) => setSelectedCropId(e.target.value)}
                                className="pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-agri-green/20 focus:border-agri-green transition-all appearance-none cursor-pointer min-w-[200px]"
                            >
                                <option value="" disabled>Select Crop Field</option>
                                {crops.map(crop => (
                                    <option key={crop.id} value={crop.id}>{crop.name} - {crop.area} Acres</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
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
                                className={`border-2 border-dashed rounded-xl h-80 flex flex-col items-center justify-center transition-all duration-200 relative overflow-hidden group ${selectedImage || isCameraActive ? 'border-agri-green/50 bg-gray-50' : 'border-gray-300'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />

                                {isCameraActive ? (
                                    <div className="w-full h-full relative">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                            <button
                                                onClick={capturePhoto}
                                                className="bg-agri-green text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform"
                                            >
                                                <Camera size={24} />
                                            </button>
                                            <button
                                                onClick={stopCamera}
                                                className="bg-red-500 text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>
                                    </div>
                                ) : selectedImage ? (
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
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-center p-6 cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-green-50/50 transition-colors"
                                    >
                                        <div className="w-16 h-16 bg-green-100/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Upload size={32} className="text-agri-green/80" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-700 mb-1">{t('scan.clickUpload')}</p>
                                        <p className="text-xs text-gray-400">{t('scan.supports')}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 space-y-3">
                                {!isCameraActive && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Upload size={18} /> {t('scan.selectFile')}
                                        </button>
                                        <button
                                            onClick={startCamera}
                                            className="flex-1 py-3 px-4 rounded-xl border border-agri-green text-agri-green font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Camera size={18} /> {t('scan.takePhoto')}
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={handleAnalyze}
                                    disabled={!selectedImage || analyzing}
                                    className={`w-full py-4 px-4 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 text-base shadow-lg ${!selectedImage || analyzing
                                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-agri-green to-emerald-600 hover:shadow-agri-green/30 hover:-translate-y-0.5'
                                        }`}
                                >
                                    {analyzing ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            {t('scan.analyzing')}
                                        </span>
                                    ) : (
                                        <>
                                            <Leaf size={20} />
                                            {t('scan.analyze')}
                                        </>
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
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-4"
                                >
                                    {/* Diagnosis Card */}
                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-6 md:p-8 relative overflow-hidden">
                                        <div className={`absolute top-0 left-0 w-2 h-full ${result.severity === 'high' ? 'bg-red-500' : result.severity === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                            }`}></div>

                                        <div className="space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Diagnosis Result</p>
                                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{result.diseaseLocal}</h3>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">AI Confidence</p>
                                                    <p className="text-3xl font-black text-agri-green">{result.confidence}%</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 ${result.severity === 'high' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                    result.severity === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-green-50 text-agri-green border border-green-100'
                                                    }`}>
                                                    <AlertTriangle size={14} /> {result.severity} Severity
                                                </span>
                                                <span className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-xs font-black uppercase flex items-center gap-2">
                                                    <CheckCircle size={14} /> AI Verified
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Cause */}
                                                <div className="bg-blue-50/30 rounded-2xl p-5 border border-blue-100/50">
                                                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <AlertTriangle size={16} />
                                                        Disease Cause
                                                    </h4>
                                                    <p className="text-sm text-gray-700 font-bold leading-relaxed">{result.cause || 'Environmental factors or pathogen activity.'}</p>
                                                </div>

                                                {/* Treatment Solution */}
                                                <div className="bg-green-50/30 rounded-2xl p-5 border border-green-100/50">
                                                    <h4 className="text-xs font-black text-agri-green uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <CheckCircle size={16} />
                                                        Treatment Plan
                                                    </h4>
                                                    <p className="text-sm text-gray-700 font-bold leading-relaxed">{result.treatment || 'No specific treatment required.'}</p>
                                                </div>

                                                {/* Prevention */}
                                                <div className="bg-purple-50/30 rounded-2xl p-5 border border-purple-100/50">
                                                    <h4 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <History size={16} />
                                                        Preventive Action
                                                    </h4>
                                                    <p className="text-sm text-gray-700 font-bold leading-relaxed">{result.prevention || 'Regular monitoring recommended.'}</p>
                                                </div>

                                                {/* Fertilizer Recommendation */}
                                                <div className="bg-amber-50/30 rounded-2xl p-5 border border-amber-100/50">
                                                    <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <Leaf size={16} />
                                                        Fertilizer Advice
                                                    </h4>
                                                    <p className="text-sm text-gray-700 font-bold leading-relaxed">{result.fertilizer || 'Balanced NPK maintenance.'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center justify-center gap-3 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black disabled:opacity-50 transition-all shadow-lg active:scale-95 text-sm"
                                        >
                                            <FileText size={20} />
                                            {saving ? 'Generating...' : 'Export Report'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedHistoryScan({
                                                    ...result,
                                                    disease_detected: result.diseaseLocal || result.disease,
                                                    image_url: selectedImage,
                                                    crop_id: selectedCropId,
                                                    created_at: new Date().toISOString()
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className="flex items-center justify-center gap-3 py-4 bg-agri-green text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-sm active:scale-95 text-sm"
                                        >
                                            <Calculator size={20} /> Treatment Budget
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12"
                                >
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                                        <CheckCircle size={40} className="text-gray-200" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2">Analysis Pending</h3>
                                    <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto">Upload or capture an image of the affected crop to start the AI disease diagnosis.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* --- Crop Disease History Timeline --- */}
                <div className="mt-16 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
                        <div>
                            <div className="flex items-center gap-2 text-agri-green font-black text-xs uppercase tracking-[0.2em] mb-2">
                                <History size={16} /> Monitoring System
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Crop Disease History</h2>
                        </div>

                        {/* Health Trend Indicator */}
                        <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${trend.color.replace('text', 'bg')}/10 ${trend.color}`}>
                                <trend.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Health Trend</p>
                                <p className={`text-lg font-black ${trend.color}`}>{trend.status}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        {/* Connected Line */}
                        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gray-100 hidden md:block" />

                        <div className="space-y-8">
                            {loadingHistory ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-10 h-10 border-4 border-agri-green border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-gray-400 font-bold">Fetching History...</p>
                                </div>
                            ) : scanHistory.length === 0 ? (
                                <div className="py-20 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
                                    <p className="text-gray-400 font-bold">No disease history found for this crop.</p>
                                </div>
                            ) : (
                                scanHistory.map((scan, idx) => (
                                    <motion.div
                                        key={scan.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative pl-0 md:pl-20 group"
                                    >
                                        {/* Timeline Dot */}
                                        <div className={`absolute left-[20px] top-6 w-4 h-4 rounded-full border-4 border-white shadow-md z-10 hidden md:block ${scan.severity === 'high' ? 'bg-red-500' : scan.severity === 'medium' ? 'bg-amber-500' : 'bg-agri-green'
                                            }`} />
                                        {/* Entry Card */}
                                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-gray-100 transition-all">
                                            <div
                                                onClick={() => {
                                                    setSelectedHistoryScan(scan);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner bg-gray-100 shrink-0">
                                                        <img src={scan.image_url} alt="Scan" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-xs font-black text-agri-green bg-green-50 px-3 py-1 rounded-full uppercase">Scan – {new Date(scan.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                                                            {idx === 0 && <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Latest</span>}
                                                        </div>
                                                        <h4 className="text-xl font-black text-gray-900 mb-1">{scan.disease_detected}</h4>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5"><CheckCircle size={14} className="text-agri-green" /> Health: {scan.health_score || 85}%</span>
                                                            <span className={`text-xs font-bold flex items-center gap-1.5 ${scan.severity === 'high' ? 'text-red-500' : scan.severity === 'medium' ? 'text-amber-500' : 'text-agri-green'
                                                                }`}>
                                                                <AlertTriangle size={14} /> {scan.severity.toUpperCase()} RIsk
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 justify-between md:justify-end">
                                                    <div className="text-right hidden lg:block">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Detection Confidence</p>
                                                        <p className="text-xl font-black text-gray-900">{scan.confidence}%</p>
                                                    </div>
                                                    <div className="px-5 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl flex items-center gap-2 group-hover:bg-agri-green group-hover:text-white transition-all">
                                                        Planning <ChevronRight size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Predictive Budgeting & Treatment Modal --- */}
                <AnimatePresence>
                    {isModalOpen && selectedHistoryScan && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-6 md:p-10"
                            >
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full transition-all"
                                >
                                    <X size={24} />
                                </button>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    {/* Modal Sidebar */}
                                    <div className="lg:col-span-4 space-y-8">
                                        <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-inner h-64">
                                            <img src={selectedHistoryScan.image_url} alt="Disease" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                                            <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Diagnosis Info</h5>
                                            <div>
                                                <p className="text-2xl font-black text-gray-900">{selectedHistoryScan.disease_detected}</p>
                                                <p className="text-sm font-bold text-agri-green">{selectedHistoryScan.confidence}% Confidence</p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${selectedHistoryScan.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                                    }`}>
                                                    {selectedHistoryScan.severity} Severity
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Content */}
                                    <div className="lg:col-span-8 space-y-10">
                                        <div>
                                            <div className="flex items-center gap-2 text-agri-green font-black text-xs uppercase tracking-widest mb-2">
                                                <Calculator size={16} /> Budgeting Module
                                            </div>
                                            <h3 className="text-3xl font-black text-gray-900">
                                                {selectedHistoryScan.disease_detected.includes('Healthy')
                                                    ? 'Crop Wellness Plan'
                                                    : 'Predictive Treatment Budget'}
                                            </h3>
                                        </div>

                                        {selectedHistoryScan.disease_detected.includes('Healthy') ? (
                                            <div className="space-y-8">
                                                <div className="bg-green-50 rounded-[2rem] p-8 border border-green-100 flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-agri-green shadow-sm shrink-0">
                                                        <ShieldCheck size={32} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black text-gray-900">No Disease Detected</h4>
                                                        <p className="text-sm text-gray-500 font-bold">Your crop appears healthy. No chemical treatment is required at this stage.</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {[
                                                        { title: 'Nutrient Monitoring', icon: Leaf, desc: 'Regularly check NPK levels to maintain growth.' },
                                                        { title: 'Irrigation Balance', icon: Droplets, desc: 'Ensure consistent soil moisture based on stage.' },
                                                        { title: 'Weather Watch', icon: CloudRain, desc: 'Monitor humidity to prevent future outbreaks.' }
                                                    ].map((item, i) => (
                                                        <div key={i} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-3">
                                                            <item.icon className="text-agri-green" size={24} />
                                                            <h5 className="font-black text-gray-900">{item.title}</h5>
                                                            <p className="text-xs text-gray-500 line-clamp-2">{item.desc}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Farm Input Panel */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Farm Area</p>
                                                        <p className="text-lg font-black text-gray-900">{(crops.find(c => c.id === selectedCropId)?.area || 3.5)} Acres</p>
                                                    </div>
                                                    <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Crop Type</p>
                                                        <p className="text-lg font-black text-gray-900">{selectedHistoryScan.disease_detected.split('___')[0] || 'Unknown'}</p>
                                                    </div>
                                                    <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Issue Class</p>
                                                        <p className="text-lg font-black text-gray-900">{selectedHistoryScan.disease_detected.includes('Deficiency') ? 'Nutrient' : 'Pathogen'}</p>
                                                    </div>
                                                    <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Market Region</p>
                                                        <p className="text-lg font-black text-gray-900">MH-West</p>
                                                    </div>
                                                </div>

                                                {/* Dynamic Cost Calculation from Protocol */}
                                                {(() => {
                                                    const protocol = getProtocol(selectedHistoryScan.disease_detected);
                                                    const area = crops.find(c => c.id === selectedCropId)?.area || 3.5;

                                                    if (!protocol) return <div className="p-8 bg-red-50 text-red-600 rounded-3xl">Protocol data for this disease is currently being updated by our agronomists.</div>;

                                                    const totalQty = (area * protocol.dosage).toFixed(2);
                                                    const productCost = Math.round(area * protocol.dosage * protocol.pricePerUnit);
                                                    const laborCost = 800;

                                                    return (
                                                        <>
                                                            <div className="bg-gray-900 text-white rounded-[2rem] p-8 space-y-6">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="text-xl font-black">Treatment Quantity & Cost</h4>
                                                                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase">Fuzzy Mapping Active</span>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                    <div className="space-y-4">
                                                                        <div className="flex justify-between items-center text-sm">
                                                                            <span className="text-gray-400">Recommended {selectedHistoryScan.disease_detected.includes('Deficiency') ? 'Fertilizer' : 'Chemical'}</span>
                                                                            <span className="font-bold">{protocol.chemical}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center text-sm">
                                                                            <span className="text-gray-400">Dosage per Acre</span>
                                                                            <span className="font-bold">{protocol.dosage} {protocol.unit}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center text-lg font-bold pt-4 border-t border-white/10">
                                                                            <span>Total Quantity Required</span>
                                                                            <span className="text-agri-green">{totalQty} {protocol.unit}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        <div className="flex justify-between items-center text-sm">
                                                                            <span className="text-gray-400">Market Price Appx</span>
                                                                            <span className="font-bold">₹{protocol.pricePerUnit} / {protocol.unit}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center text-sm">
                                                                            <span className="text-gray-400">Application Method</span>
                                                                            <span className="font-bold">{protocol.method}</span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center text-3xl font-black pt-4 border-t border-white/10">
                                                                            <span>Total Budget</span>
                                                                            <span className="text-agri-green">₹{productCost + laborCost}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Marketplace Links */}
                                                            <div className="space-y-4">
                                                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                    <ShoppingCart size={16} /> Purchase {protocol.chemical.split(' ')[0]} Now
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <a href={protocol.marketplaceLinks.agrostar} target="_blank" className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-agri-green hover:shadow-lg transition-all">
                                                                        <span className="font-black text-gray-900">AgroStar</span>
                                                                        <ExternalLink size={16} className="text-agri-green" />
                                                                    </a>
                                                                    <a href={protocol.marketplaceLinks.bighaat} target="_blank" className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-agri-green hover:shadow-lg transition-all">
                                                                        <span className="font-black text-gray-900">BigHaat</span>
                                                                        <ExternalLink size={16} className="text-agri-green" />
                                                                    </a>
                                                                    <a href={protocol.marketplaceLinks.indiamart} target="_blank" className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-agri-green hover:shadow-lg transition-all">
                                                                        <span className="font-black text-gray-900">IndiaMART</span>
                                                                        <ExternalLink size={16} className="text-agri-green" />
                                                                    </a>
                                                                </div>
                                                            </div>

                                                            {/* Organic Options */}
                                                            <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                                                                <h4 className="text-xs font-black text-agri-green uppercase tracking-widest flex items-center gap-2 mb-6">
                                                                    <ShieldCheck size={16} /> Organic Treatment Alternatives
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                    <div className="flex gap-4">
                                                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-agri-green shadow-sm shrink-0">
                                                                            <Leaf size={24} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-black text-gray-900">{protocol.organicAlternative}</p>
                                                                            <p className="text-xs text-gray-500 font-bold">Required: {(area * protocol.organicDosage).toFixed(1)} {protocol.organicUnit} • Est. Cost: ₹{Math.round(area * protocol.organicPrice)}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center justify-center bg-white/50 rounded-2xl p-4 border border-white">
                                                                        <p className="text-[10px] font-bold text-gray-400 italic text-center">Using organic alternatives can improve long-term soil health by up to 15%.</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </FarmerDashboardLayout>
    );
}

