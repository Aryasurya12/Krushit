import React from 'react';

// ============================================================================
// PDF REPORT TEMPLATE DATA STRUCTURE
// ============================================================================
export interface ReportData {
  appName: string;
  date: string;
  reportId: string;
  
  disease: {
    name: string;
    confidence: number | string;
    severity: string;
    verified: boolean;
  };
  
  diagnosis?: {
    cause?: string;
    treatment?: string;
    prevention?: string;
    fertilizer?: string;
  };
  
  farm?: {
    area?: string;
    cropType?: string;
    issueType?: string;
    region?: string;
  };
  
  budget?: {
    chemical?: string;
    dosagePerAcre?: string;
    totalQuantity?: string;
    pricePerKg?: string | number;
    applicationMethod?: string;
    totalCost?: string | number;
  };
  
  organicAlternatives?: Array<{
    name: string;
    quantity: string;
    cost: string | number;
    benefit: string;
  }>;
  
  purchaseLinks?: Array<{
    name: string;
    url: string;
  }>;
  
  imageUrl?: string;
}

// Helper to format text (remove underscores, capitalize)
const formatText = (text: string) => {
  if (!text) return '';
  return text
    .replace(/_+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

interface PdfReportTemplateProps {
  data: ReportData;
}

// ============================================================================
// DYNAMIC REPORT COMPONENT
// Designed for A4 Print: 210mm x 297mm (Standard resolution usually ~794px width)
// Can be used with libraries like html2pdf.js, standard window.print(), or Puppeteer.
// CSS @media print handles margin rules.
// ============================================================================
export const PdfReportTemplate: React.FC<PdfReportTemplateProps> = ({ data }) => {
  if (!data) return null;

  // Severity Logic
  const sevLower = data.disease?.severity?.toLowerCase() || 'low';
  const isHigh = sevLower === 'high' || sevLower === 'critical';
  const isMedium = sevLower === 'medium' || sevLower === 'moderate';
  
  const severityStyles = isHigh 
    ? 'bg-red-50 text-red-700 border-red-200' 
    : isMedium 
      ? 'bg-orange-50 text-orange-700 border-orange-200' 
      : 'bg-green-50 text-green-700 border-green-200';

  return (
    <div className="pdf-container print:bg-white bg-slate-100 p-8 flex justify-center w-[800px] min-h-[1131px]">
      
      {/* 
        A4 Container wrapper 
        Using standard web A4 dimensions approx mapping: w-[210mm] max-w-[800px]
      */}
      <div 
        id="pdf-report-content" 
        className="w-full max-w-[800px] bg-white print:shadow-none shadow-2xl rounded-sm print:rounded-none overflow-hidden relative font-sans text-gray-800"
      >
        
        {/* ==================== 1. HEADER ==================== */}
        <div className="bg-gray-900 text-white p-6 md:p-8 flex justify-between items-center break-inside-avoid">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">{data.appName || 'Krushit'}</h1>
            <p className="text-emerald-400 font-semibold text-sm tracking-wide uppercase">AI Crop Disease Detection Report</p>
          </div>
          <div className="text-right">
            <p className="text-gray-300 text-sm font-medium">{data.date}</p>
            <p className="text-gray-500 text-xs mt-1 font-mono uppercase">ID: {data.reportId}</p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">

          {/* ==================== 2. DIAGNOSIS SUMMARY ==================== */}
          <section className="break-inside-avoid flex flex-col md:flex-row gap-6 items-start">
            
            {/* 8. IMAGE (OPTIONAL) */}
            {data.imageUrl && (
              <div className="w-48 h-48 rounded-2xl overflow-hidden shrink-0 border border-gray-200 shadow-sm">
                <img 
                  src={data.imageUrl} 
                  alt={formatText(data.disease?.name)} 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}

            <div className="flex-1 space-y-4 w-full">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Diagnosis Result</p>
                <h2 className="text-3xl font-black text-gray-900 leading-tight">
                  {formatText(data.disease?.name) || 'Unknown Condition'}
                </h2>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {/* Confidence Badge */}
                {data.disease?.confidence && (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-black uppercase bg-gray-100 text-gray-800 border border-gray-200">
                    <span className="text-emerald-500 mr-1">●</span> {data.disease.confidence}% Confidence
                  </span>
                )}
                
                {/* Severity Badge */}
                {data.disease?.severity && (
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase border ${severityStyles}`}>
                    {data.disease.severity} Severity
                  </span>
                )}

                {/* AI Verified */}
                {data.disease?.verified && (
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-black uppercase flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    AI Verified
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* ==================== 4. FARM DETAILS (DYNAMIC) ==================== */}
          {data.farm && Object.values(data.farm).some(v => v) && (
            <section className="break-inside-avoid grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {Object.entries(data.farm).map(([key, value]) => {
                if (!value) return null;
                // Auto format camelCase to Title Space
                const label = key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase());
                return (
                  <div key={key} className="text-center md:text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-bold text-gray-900">{formatText(value)}</p>
                  </div>
                );
              })}
            </section>
          )}

          {/* ==================== 3. INFO CARDS (AUTO-FILLED) ==================== */}
          {data.diagnosis && Object.values(data.diagnosis).some(v => v) && (
            <section className="break-inside-avoid space-y-4">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-2">Analysis & Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {data.diagnosis.cause && (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-2">Disease Cause</h4>
                    <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{formatText(data.diagnosis.cause)}</p>
                  </div>
                )}
                
                {data.diagnosis.treatment && (
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-2">Treatment Plan</h4>
                    <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{formatText(data.diagnosis.treatment)}</p>
                  </div>
                )}

                {data.diagnosis.prevention && (
                  <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                    <h4 className="text-xs font-black text-purple-700 uppercase tracking-widest mb-2">Preventive Action</h4>
                    <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{formatText(data.diagnosis.prevention)}</p>
                  </div>
                )}

                {data.diagnosis.fertilizer && (
                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                    <h4 className="text-xs font-black text-orange-700 uppercase tracking-widest mb-2">Fertilizer Advice</h4>
                    <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{formatText(data.diagnosis.fertilizer)}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ==================== 5. TREATMENT BUDGET ==================== */}
          {data.budget && Object.values(data.budget).some(v => v) && (
            <section className="break-inside-avoid bg-gray-900 text-white p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-black mb-6 text-emerald-400">Estimated Treatment Budget</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.entries(data.budget).map(([key, value]) => {
                  if (!value) return null;
                  const label = key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase());
                  
                  // Highlight total cost
                  const isTotal = key === 'totalCost';
                  
                  return (
                    <div key={key} className={`space-y-1 ${isTotal ? 'col-span-2 md:col-span-3 border-t border-gray-700 pt-4 mt-2' : ''}`}>
                      <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
                      <p className={`${isTotal ? 'text-3xl text-white' : 'text-lg text-gray-100'} font-black break-words`}>
                        {isTotal && typeof value === 'number' ? '₹' : ''}{value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ==================== 7. ORGANIC ALTERNATIVES ==================== */}
          {data.organicAlternatives && data.organicAlternatives.length > 0 && (
            <section className="break-inside-avoid">
              <h3 className="text-lg font-black text-gray-900 mb-4 inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Organic Alternatives
              </h3>
              <div className="space-y-3">
                {data.organicAlternatives.map((alt, idx) => (
                  <div key={idx} className="p-4 border border-emerald-100 bg-emerald-50/30 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="md:col-span-2">
                      <p className="font-bold text-gray-900">{formatText(alt.name)}</p>
                      <p className="text-xs text-gray-500 font-medium">{formatText(alt.benefit)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Quantity</p>
                      <p className="text-sm font-semibold text-gray-700">{alt.quantity}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Cost</p>
                      <p className="text-sm font-semibold text-emerald-700">{alt.cost}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ==================== 6. PURCHASE LINKS ==================== */}
          {data.purchaseLinks && data.purchaseLinks.length > 0 && (
            <section className="break-inside-avoid border-t border-gray-100 pt-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3 text-center">Purchase Required Materials</p>
              <div className="flex flex-wrap justify-center gap-3">
                {data.purchaseLinks.map((link, idx) => (
                  <a 
                     key={idx} 
                     href={link.url}
                     target="_blank"
                     rel="noreferrer"
                     className="px-4 py-2 bg-white border border-gray-200 text-gray-800 text-sm font-bold rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors print:hidden"
                  >
                    Buy on {link.name}
                  </a>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* ==================== 9. FOOTER ==================== */}
        <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-between items-center mt-auto">
          <p className="text-xs text-gray-400 font-bold tracking-wide">Generated by {data.appName || 'Krushit'} AI Solutions</p>
          <div className="flex gap-4">
             <p className="text-xs text-gray-400 font-mono">{data.date}</p>
             <p className="text-xs text-gray-400 font-mono">Page 1</p>
          </div>
        </div>

      </div>

      {/* Global CSS required to render proper margins during print */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          .pdf-container {
            padding: 0 !important;
            background: none !important;
          }
          #pdf-report-content {
            box-shadow: none !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
          @page {
            size: A4;
            margin: 10mm 10mm; 
          }
          /* Hide non-print elements */
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
};
